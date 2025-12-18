import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave, FiRepeat } from 'react-icons/fi'; 
import api from '../api';
import CustomSelect from './CustomSelect';
import AlertModal from './AlertModal'; 

export default function TransferModal({ isOpen, onClose, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [alertData, setAlertData] = useState({ isOpen: false, message: '' });

  const [formData, setFormData] = useState({
    from_wallet_id: '',
    to_wallet_id: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const loadWallets = async () => {
        try {
            const res = await api.get('/wallets');
            const activeWallets = res.data
                .filter(w => !w.deleted_at)
                .map(w => ({
                    value: w.id, 
                    label: `${w.name} (Rp ${new Intl.NumberFormat('id-ID').format(w.current_balance)})`, 
                    original_balance: w.current_balance
                }));
            setWallets(activeWallets);
        } catch(err) { console.error(err); }
    };
    if (isOpen) loadWallets();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
      setFormData({ from_wallet_id: '', to_wallet_id: '', amount: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  const handleSwap = () => {
    setFormData(prev => ({
        ...prev,
        from_wallet_id: prev.to_wallet_id,
        to_wallet_id: prev.from_wallet_id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.from_wallet_id || !formData.to_wallet_id || !formData.amount) {
        setAlertData({ isOpen: true, message: "Mohon lengkapi data transfer." });
        return;
    }
    if (formData.from_wallet_id === formData.to_wallet_id) {
        setAlertData({ isOpen: true, message: "Dompet asal dan tujuan tidak boleh sama." });
        return;
    }

    setSubmitting(true);
    try {
      await api.post('/transfers', formData);
      onSuccess(); 
      onClose();   
    } catch (error) {
      setAlertData({ 
          isOpen: true, 
          message: error.response?.data?.message || "Gagal melakukan transfer." 
      });
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
          <div>
            <h3 className="font-bold text-xl text-gray-800">Transfer Saldo</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pindahkan uang antar dompet Anda</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 relative">
             
             <button 
                type="button"
                onClick={handleSwap}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-blue-200 rounded-full flex items-center justify-center text-blue-600 shadow-sm hover:scale-110 hover:shadow-md transition-all z-10"
                title="Tukar Posisi Dompet"
             >
                <FiRepeat size={14} />
             </button>

             <div className="space-y-5">
                <CustomSelect 
                    label="Dari Dompet"
                    placeholder="Pilih Sumber Dana"
                    options={wallets}
                    value={formData.from_wallet_id}
                    onChange={(val) => setFormData({...formData, from_wallet_id: val})}
                />

                <CustomSelect 
                    label="Ke Dompet"
                    placeholder="Pilih Penerima Dana"
                    options={wallets}
                    value={formData.to_wallet_id}
                    onChange={(val) => setFormData({...formData, to_wallet_id: val})}
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nominal Transfer</label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                <input 
                    type="number" 
                    required 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold text-gray-800" 
                    placeholder="0" 
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</label>
                <input 
                    type="date" 
                    required 
                    value={formData.transaction_date} 
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" 
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan</label>
                <input 
                    type="text" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" 
                    placeholder="Opsional..." 
                />
             </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
                {submitting ? 'Memproses...' : <><FiSave size={18} /> Transfer Sekarang</>}
            </button>
          </div>
        </form>

        <AlertModal 
            isOpen={alertData.isOpen}
            onClose={() => setAlertData({...alertData, isOpen: false})}
            title="Gagal Transfer"
            message={alertData.message}
        />

      </div>
    </div>, document.body
  );
}