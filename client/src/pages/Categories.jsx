import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import CategoryModal from '../components/CategoryModal';
import TrashCategoryModal from '../components/TrashCategoryModal';
import ConfirmModal from '../components/ConfirmModal'; 
import AlertModal from '../components/AlertModal'; // <--- IMPORT MODAL BARU
import api from '../api';
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';

// ... (CardSkeleton tetap sama) ...
const CardSkeleton = () => (
  <div className="h-24 rounded-2xl bg-gray-100 animate-pulse border border-gray-200"></div>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [activeTab, setActiveTab] = useState('expense'); 
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [editData, setEditData] = useState(null); 
  
  // State untuk Konfirmasi & Warning
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [warningData, setWarningData] = useState({ isOpen: false, message: '' }); // <--- STATE BARU

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.type === activeTab && 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cat) => {
    setEditData(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  // --- LOGIKA DELETE DIPERBAIKI ---
  const executeDelete = async () => {
    try {
      // 1. Coba hapus
      await api.delete(`/categories/${confirmData.id}`);
      
      // 2. Jika sukses, tutup confirm modal & refresh data
      setConfirmData({ ...confirmData, isOpen: false });
      fetchCategories();

    } catch (error) {
      // 3. Jika GAGAL (karena dipakai transaksi), tangkap errornya
      const errorMessage = error.response?.data?.message || "Gagal menghapus kategori.";
      
      // 4. Tutup modal konfirmasi dulu
      setConfirmData({ ...confirmData, isOpen: false });

      // 5. TAMPILKAN ALERT MODAL (Bukan alert biasa)
      setWarningData({
        isOpen: true,
        message: errorMessage
      });
    }
  };

  return (
    <MainLayout>
      {/* ... HEADER, FILTER, GRID (Kode Layout Sama Seperti Sebelumnya) ... */}
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Kategori
          </h1>
          <p className="text-sm text-gray-500 mt-1">Atur label untuk transaksi pemasukan & pengeluaran.</p>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setIsTrashOpen(true)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 text-sm font-medium">
              <FiTrash2 /> Sampah
            </button>
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95">
              <FiPlus size={18} /> Tambah
            </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button onClick={() => setActiveTab('expense')} className={`flex-1 sm:w-32 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengeluaran</button>
            <button onClick={() => setActiveTab('income')} className={`flex-1 sm:w-32 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pemasukan</button>
        </div>
        <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
             [...Array(8)].map((_, i) => <CardSkeleton key={i} />)
          ) : filteredCategories.length === 0 ? (
             <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                <p>Belum ada kategori {activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'}.</p>
             </div>
          ) : (
            filteredCategories.map((cat) => (
                <div key={cat.id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2" style={{ backgroundColor: cat.color }}></div>
                    <div className="pl-3 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                            <p className="text-xs text-gray-400 uppercase mt-0.5 tracking-wider">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <button onClick={() => handleEdit(cat)} className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDeleteClick(cat.id)} className="p-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><FiTrash2 size={14} /></button>
                    </div>
                </div>
            ))
          )}
      </div>

      {/* MODAL LAINNYA */}
      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchCategories} editData={editData} />
      <TrashCategoryModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} onUpdate={fetchCategories} />

      {/* CONFIRM MODAL (Hanya untuk konfirmasi awal) */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        onConfirm={executeDelete}
        title="Hapus Kategori?"
        message="Kategori ini akan dipindahkan ke sampah."
        type="danger"
      />

      {/* --- ALERT MODAL (BARU) --- */}
      {/* Muncul jika delete gagal karena masih dipakai transaksi */}
      <AlertModal
        isOpen={warningData.isOpen}
        onClose={() => setWarningData({ ...warningData, isOpen: false })}
        title="Tidak Dapat Menghapus"
        message={warningData.message}
      />

    </MainLayout>
  );
}