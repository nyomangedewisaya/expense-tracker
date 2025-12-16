import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../api';
import CustomSelect from './CustomSelect'; 

export default function BudgetModal({ isOpen, onClose, onSuccess, editData }) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    start_date: firstDay,
    end_date: lastDay
  });

  useEffect(() => {
    const loadCats = async () => {
        try {
            const res = await api.get('/categories?type=expense');
            setCategories(res.data.map(c => ({ value: c.id, label: c.name, color: c.color })));
        } catch(err) { console.error(err); }
    };
    if (isOpen) loadCats();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
      
      if (editData) {
        setFormData({
            category_id: editData.category_id,
            amount: editData.amount,
            start_date: editData.start_date.split('T')[0],
            end_date: editData.end_date.split('T')[0]
        });
      } else {
        setFormData({ category_id: '', amount: '', start_date: firstDay, end_date: lastDay });
      }
    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.amount) {
        alert("Mohon lengkapi data"); return;
    }
    setSubmitting(true);
    try {
      if (editData) {
        await api.put(`/budgets/${editData.id}`, formData);
      } else {
        await api.post('/budgets', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>

      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all duration-300 ease-out ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-xl text-gray-800">{editData ? 'Edit Anggaran' : 'Anggaran Baru'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><FiX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <CustomSelect 
            label="Kategori Pengeluaran"
            placeholder="Pilih Kategori"
            options={categories}
            value={formData.category_id}
            onChange={(val) => setFormData({...formData, category_id: val})}
            disabled={!!editData} 
          />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limit Anggaran (Rp)</label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold text-gray-800" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Mulai</label>
                <input type="date" required value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Selesai</label>
                <input type="date" required value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
             </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">{submitting ? 'Menyimpan...' : <><FiSave size={18} /> Simpan</>}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}