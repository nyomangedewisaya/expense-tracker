import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../api';

export default function CategoryModal({ isOpen, onClose, onSuccess, editData }) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#000000'
  });

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
      
      if (editData) {
        setFormData({
          name: editData.name,
          type: editData.type,
          color: editData.color || '#000000'
        });
      } else {
        setFormData({ name: '', type: 'expense', color: '#EF4444' });
      }

    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await api.put(`/categories/${editData.id}`, {
            name: formData.name,
            color: formData.color
        });
      } else {
        await api.post('/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all duration-300 ease-out ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800">{editData ? 'Edit Kategori' : 'Kategori Baru'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!!editData} 
                onClick={() => setFormData({...formData, type: 'income'})}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all border 
                  ${formData.type === 'income' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-2 ring-emerald-100' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                  ${editData ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                Pemasukan
              </button>
              <button
                type="button"
                disabled={!!editData}
                onClick={() => setFormData({...formData, type: 'expense'})}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all border 
                  ${formData.type === 'expense' 
                    ? 'bg-red-50 text-red-600 border-red-200 ring-2 ring-red-100' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                   ${editData ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                Pengeluaran
              </button>
            </div>
            {editData && <p className="text-[10px] text-gray-400 mt-1 italic">*Tipe kategori tidak dapat diubah.</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Kategori</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm font-medium"
              placeholder="Contoh: Belanja, Gaji, dll"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Warna Label</label>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full shadow-inner border border-gray-200" style={{ backgroundColor: formData.color }}></div>
               
               <div className="flex-1 relative">
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-mono text-center cursor-pointer hover:bg-gray-100 transition-colors">
                    {formData.color.toUpperCase()} (Klik Ubah)
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
              {submitting ? 'Menyimpan...' : <><FiSave size={18} /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}