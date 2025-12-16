import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiRefreshCw, FiTrash2, FiAlertOctagon } from 'react-icons/fi';
import api from '../api';
import ConfirmModal from './ConfirmModal'; // Import Modal Konfirmasi
import AlertModal from './AlertModal';     // Import Modal Alert

export default function TrashCategoryModal({ isOpen, onClose, onUpdate }) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk Modal Konfirmasi & Alert
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
      fetchDeleted();
    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/trash');
      setDeletedCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/categories/${id}/restore`);
      fetchDeleted();
      onUpdate(); // Refresh halaman utama
    } catch (error) {
      // Tampilkan Alert Modal jika gagal restore
      setAlertData({
        isOpen: true,
        title: "Gagal Memulihkan",
        message: error.response?.data?.message || "Terjadi kesalahan saat memulihkan data."
      });
    }
  };

  // 1. Trigger saat tombol tong sampah diklik
  const handleHardDeleteClick = (id) => {
    setConfirmData({
      isOpen: true,
      id: id
    });
  };

  // 2. Eksekusi Hapus Permanen setelah konfirmasi "Ya"
  const executeHardDelete = async () => {
    try {
      await api.delete(`/categories/${confirmData.id}/permanent`);
      
      // Sukses -> Refresh list
      fetchDeleted();
      setConfirmData({ ...confirmData, isOpen: false }); // Tutup konfirmasi

    } catch (error) {
      // Gagal -> Tutup konfirmasi -> Buka Alert Warning
      setConfirmData({ ...confirmData, isOpen: false });
      
      setAlertData({
        isOpen: true,
        title: "Gagal Menghapus Permanen",
        message: error.response?.data?.message || "Kategori ini mungkin terkunci oleh sistem atau server sedang sibuk."
      });
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop Modal Utama */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Container Modal Utama */}
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all duration-300 ease-out flex flex-col max-h-[85vh] ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-red-100 rounded-full text-red-500"><FiTrash2 /></div>
             <h3 className="font-bold text-lg text-gray-800">Sampah Kategori</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* List Content */}
        <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Memuat data sampah...</div>
          ) : deletedCategories.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3 border border-gray-100"><FiTrash2 size={24}/></div>
                <p className="text-gray-600 font-bold">Sampah Kosong</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada kategori yang dihapus.</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
                {deletedCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-blue-100 transition-all group">
                        <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: cat.color }}></div>
                             <div>
                                <p className="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">{cat.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleRestore(cat.id)}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Pulihkan"
                            >
                                <FiRefreshCw size={16} />
                            </button>
                            <button 
                                onClick={() => handleHardDeleteClick(cat.id)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Hapus Permanen"
                            >
                                <FiAlertOctagon size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL KONFIRMASI (HARD DELETE) --- */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        onConfirm={executeHardDelete}
        title="Hapus Permanen?"
        message="PERINGATAN: Kategori ini akan dihapus selamanya dari database dan TIDAK BISA dikembalikan lagi."
        type="danger"
      />

      {/* --- ALERT MODAL (ERROR HANDLING) --- */}
      <AlertModal 
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        title={alertData.title}
        message={alertData.message}
      />

    </div>,
    document.body
  );
}