import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../api';

export default function WalletModal({ isOpen, onClose, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    initial_balance: ''
  });

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.initial_balance === '') {
      alert("Nama dan Saldo Awal wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/wallets', formData);
      onSuccess();
      onClose();
      setFormData({ name: '', type: 'bank', initial_balance: '' });
    } catch (error) {
      alert(error.response?.data?.message || "Gagal membuat dompet");
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

      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all duration-300 ease-out ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-xl text-gray-800">Tambah Dompet</h3>
            <p className="text-xs text-gray-500 mt-0.5">Buat akun penyimpangan uang baru</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Dompet</label>
            <input 
              type="text" 
              placeholder="Contoh: BCA Utama, GoPay, Dompet Saku"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipe</label>
            <div className="grid grid-cols-3 gap-3">
              {['bank', 'ewallet', 'cash'].map((type) => (
                <div 
                  key={type}
                  onClick={() => setFormData({...formData, type})}
                  className={`cursor-pointer rounded-xl border px-2 py-3 text-center transition-all ${formData.type === type ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                  <span className="capitalize text-sm font-semibold">{type === 'ewallet' ? 'E-Wallet' : type}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Awal (Rp)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-500 transition-colors">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={formData.initial_balance}
                onChange={(e) => setFormData({...formData, initial_balance: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold text-gray-800"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Saldo awal saat dompet ini dibuat.</p>
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