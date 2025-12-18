import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import TransferModal from '../components/TransferModal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import api from '../api';
import { FiPlus, FiArrowRight, FiRepeat, FiTrash2, FiCalendar, FiSearch } from 'react-icons/fi';

const TransferSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 animate-pulse">
    <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
    </div>
    <div className="hidden md:block w-48 h-10 bg-gray-200 rounded-xl"></div>
    <div className="h-6 w-32 bg-gray-200 rounded self-end md:self-center"></div>
  </div>
);

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [alertData, setAlertData] = useState({ isOpen: false, message: '' });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transfers'); 
      setTransfers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  const filteredTransfers = transfers.filter(tf => 
    tf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tf.from_wallet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tf.to_wallet?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/transfers/${confirmData.id}`);
      setConfirmData({ ...confirmData, isOpen: false }); 
      fetchTransfers(); 
    } catch (error) {
      setConfirmData({ ...confirmData, isOpen: false });
      setAlertData({ 
          isOpen: true, 
          message: "Gagal menghapus riwayat transfer." 
      });
    }
  };

  return (
    <MainLayout>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            Riwayat Transfer
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola perpindahan dana antar dompet Anda.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
        >
          <FiPlus size={20} /> Transfer Baru
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Cari transfer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
        </div>
      </div>

      <div className="flex flex-col gap-4 min-h-[400px]">
        {loading ? (
            [...Array(5)].map((_, i) => <TransferSkeleton key={i} />)
        ) : filteredTransfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
                    <FiRepeat />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada riwayat transfer</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                    Pindahkan uang antar dompet (misal: Bank ke E-Wallet) dan catat riwayatnya disini.
                </p>
                <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-semibold hover:underline">
                    Mulai Transfer Sekarang
                </button>
            </div>
        ) : (
            filteredTransfers.map((tf) => (
                <div 
                    key={tf.id} 
                    className="
                        bg-white p-5 rounded-2xl border border-gray-100 shadow-sm 
                        hover:shadow-md hover:-translate-y-1 transition-all duration-300
                        flex flex-col md:flex-row md:items-center gap-4 group
                    "
                >
                    
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

                    <div className="w-full md:w-auto flex justify-center order-last md:order-none mt-2 md:mt-0">
                        <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl w-full md:w-auto md:min-w-[220px]">
                            <div className="text-right flex-1 md:flex-none">
                               <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block truncate max-w-[100px]">{tf.from_wallet.name}</span>
                            </div>
                            <div className="text-gray-400 shrink-0"><FiArrowRight size={12} /></div>
                            <div className="text-left flex-1 md:flex-none">
                               <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block truncate max-w-[100px]">{tf.to_wallet.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:flex-1 w-full">
                        <span className="font-bold text-gray-800 text-lg md:text-xl">
                            {formatRupiah(tf.amount)}
                        </span>
                        
                        <button 
                            onClick={() => handleDeleteClick(tf.id)}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Hapus Riwayat"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>

                </div>
            ))
        )}
      </div>

      <TransferModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTransfers} />
      <ConfirmModal isOpen={confirmData.isOpen} onClose={() => setConfirmData({...confirmData, isOpen: false})} onConfirm={executeDelete} title="Hapus Riwayat Transfer?" message="Saldo dompet akan dikembalikan seperti kondisi sebelum transfer dilakukan." type="danger" />
      <AlertModal isOpen={alertData.isOpen} onClose={() => setAlertData({...alertData, isOpen: false})} title="Gagal Menghapus" message={alertData.message} />

    </MainLayout>
  );
}