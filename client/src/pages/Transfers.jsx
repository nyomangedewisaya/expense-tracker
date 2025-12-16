import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import TransferModal from '../components/TransferModal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import api from '../api';
import { FiPlus, FiArrowRight, FiRepeat, FiTrash2, FiCalendar, FiSearch } from 'react-icons/fi';

// Skeleton Loader
const TransferSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between animate-pulse">
    <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-48 bg-gray-100 rounded"></div>
    </div>
    <div className="h-6 w-24 bg-gray-200 rounded"></div>
  </div>
);

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [alertData, setAlertData] = useState({ isOpen: false, message: '' });

  // Formatters
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Fetch Data
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      // Endpoint ini menggunakan controller yang SUDAH kamu buat (supports filters tapi kita panggil polos dulu)
      const res = await api.get('/transfers'); 
      setTransfers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  // 2. Logic Delete
  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/transfers/${confirmData.id}`);
      setConfirmData({ ...confirmData, isOpen: false }); // Tutup confirm
      fetchTransfers(); // Refresh list
    } catch (error) {
      setConfirmData({ ...confirmData, isOpen: false });
      setAlertData({ 
          isOpen: true, 
          message: "Gagal menghapus riwayat transfer. Pastikan data valid." 
      });
    }
  };

  return (
    <MainLayout>
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Riwayat Transfer
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola perpindahan dana antar dompet Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <FiPlus size={18} /> Transfer Baru
        </button>
      </div>

      {/* SEARCH / FILTER BAR (Opsional, tampilan saja dulu) */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Cari transfer..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                // Disini nanti bisa dipasang logic filter client-side jika mau
            />
        </div>
      </div>

      {/* LIST TRANSFER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
            <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => <TransferSkeleton key={i} />)}
            </div>
        ) : transfers.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
                    <FiRepeat />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada transfer</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                    Pindahkan uang antar dompet (misal: Bank ke E-Wallet) dan catat riwayatnya disini.
                </p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-semibold hover:underline"
                >
                    Mulai Transfer Sekarang
                </button>
            </div>
        ) : (
            // DATA LIST (UPDATED LAYOUT)
            <div className="divide-y divide-gray-50">
                {transfers.map((tf) => (
                    <div key={tf.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center gap-4 group">
                        
                        {/* 1. KIRI: Info Tanggal & Deskripsi (Flex-1 agar mendorong tengah ke pusat) */}
                        <div className="flex items-start gap-4 md:flex-1 w-full">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                <FiRepeat size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">{tf.description || 'Transfer Saldo'}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                    <FiCalendar /> {formatDate(tf.transaction_date)}
                                </div>
                            </div>
                        </div>

                        {/* 2. TENGAH: Alur Dompet (Centered & Simetris) */}
                        <div className="w-full md:w-auto flex justify-center">
                            <div className="flex items-center justify-center gap-4 bg-white border border-gray-200 px-6 py-2.5 rounded-xl shadow-sm min-w-[220px]">
                                {/* From */}
                                <div className="text-right flex-1">
                                   <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block truncate max-w-[100px]">{tf.from_wallet.name}</span>
                                </div>
                                
                                {/* Icon Panah */}
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full shrink-0">
                                   <FiArrowRight size={14} />
                                </div>

                                {/* To */}
                                <div className="text-left flex-1">
                                   <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block truncate max-w-[100px]">{tf.to_wallet.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. KANAN: Nominal & Delete (Flex-1 Align Right) */}
                        <div className="flex items-center justify-between md:justify-end gap-6 md:flex-1 w-full">
                            <span className="font-bold text-gray-800 text-lg">
                                {formatRupiah(tf.amount)}
                            </span>
                            
                            <button 
                                onClick={() => handleDeleteClick(tf.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Hapus Riwayat (Saldo Dikembalikan)"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Modal Create */}
      <TransferModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTransfers} 
      />
      
      {/* 2. Modal Konfirmasi Delete */}
      <ConfirmModal 
        isOpen={confirmData.isOpen} 
        onClose={() => setConfirmData({...confirmData, isOpen: false})} 
        onConfirm={executeDelete}
        title="Hapus Riwayat Transfer?"
        message="Saldo dompet akan dikembalikan seperti kondisi sebelum transfer dilakukan."
        type="danger"
      />

      {/* 3. Modal Alert (Untuk Error Delete) */}
      <AlertModal 
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({...alertData, isOpen: false})}
        title="Gagal Menghapus"
        message={alertData.message}
      />

    </MainLayout>
  );
}