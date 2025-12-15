import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../api';
import CustomSelect from './CustomSelect';

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
  // State terpisah untuk Mounting (DOM) dan Animasi (CSS)
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [formData, setFormData] = useState({
    wallet_id: '',
    category_id: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Logic Animasi Smooth (Mount -> Wait -> Animate)
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Jeda 10ms agar browser merender state awal (opacity-0) dulu, baru transisi ke opacity-100
      setTimeout(() => setAnimate(true), 10); 
      fetchDropdowns();
    } else {
      setAnimate(false);
      // Tunggu animasi selesai (300ms) baru hapus dari DOM
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  const fetchDropdowns = async () => {
    setLoadingData(true);
    try {
      const [resWallets, resCats] = await Promise.all([
        api.get('/wallets'),
        api.get('/categories')
      ]);
      setWallets(resWallets.data);
      setCategories(resCats.data);
    } catch (error) {
      console.error("Gagal load dropdown", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wallet_id || !formData.category_id || !formData.amount) {
      alert("Mohon lengkapi data wajib.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transactions', formData);
      onSuccess();
      onClose(); // Trigger animasi tutup
      
      // Reset form
      setFormData({
        wallet_id: '',
        category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  const walletOptions = wallets.map(w => ({ value: w.id, label: w.name }));
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name, color: c.color }));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* 1. Backdrop Gelap (Fade In/Out) */}
      <div 
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out
          ${animate ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      ></div>

      {/* 2. Modal Card (Scale In/Out + Translate) */}
      <div className={`
        bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 
        transform transition-all duration-300 ease-out
        ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}
      `}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-xl text-gray-800">Transaksi Baru</h3>
            <p className="text-xs text-gray-500 mt-0.5">Catat pemasukan atau pengeluaranmu</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nominal (Rp)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-500 transition-colors">Rp</span>
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold text-gray-800 placeholder-gray-300"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect 
              label="Dompet"
              placeholder="Pilih Dompet"
              options={walletOptions}
              value={formData.wallet_id}
              onChange={(val) => setFormData({...formData, wallet_id: val})}
              disabled={loadingData}
            />
            <CustomSelect 
              label="Kategori"
              placeholder="Pilih Kategori"
              options={categoryOptions}
              value={formData.category_id}
              onChange={(val) => setFormData({...formData, category_id: val})}
              disabled={loadingData}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</label>
            <input 
              type="date" 
              required
              value={formData.transaction_date}
              onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm text-gray-700 font-medium bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keterangan (Opsional)</label>
            <textarea 
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm resize-none placeholder-gray-300"
              placeholder="Contoh: Makan siang..."
            ></textarea>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? 'Menyimpan...' : <><FiSave size={18} /> Simpan</>}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}