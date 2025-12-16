import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import api from '../api';
import { FiPlus, FiTarget, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';

// Skeleton Loader
const BudgetSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
    <div className="flex justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 w-full bg-gray-200 rounded-full mb-4"></div>
    <div className="flex justify-between">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [alertData, setAlertData] = useState({ isOpen: false, message: '' });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  // Logic Warna Progress Bar
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-600'; // Over budget
    if (percent >= 80) return 'bg-red-500';  // Bahaya
    if (percent >= 50) return 'bg-yellow-500'; // Waspada
    return 'bg-emerald-500'; // Aman
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  // Actions
  const handleEdit = (budget) => {
    setEditData(budget);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/budgets/${confirmData.id}`);
      setConfirmData({ ...confirmData, isOpen: false });
      fetchBudgets();
    } catch (error) {
      setConfirmData({ ...confirmData, isOpen: false });
      setAlertData({ isOpen: true, message: "Gagal menghapus anggaran." });
    }
  };

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Anggaran Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">Batasi pengeluaran agar keuangan tetap sehat.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <FiPlus size={18} /> Buat Anggaran
        </button>
      </div>

      {/* GRID BUDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [...Array(6)].map((_, i) => <BudgetSkeleton key={i} />)
        ) : budgets.length === 0 ? (
           <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-4"><FiTarget /></div>
                <h3 className="text-lg font-bold text-gray-700">Belum ada anggaran</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-xs">Buat anggaran bulanan atau mingguan untuk kategori tertentu.</p>
                <button onClick={handleCreate} className="text-blue-600 font-semibold hover:underline">Buat Sekarang</button>
           </div>
        ) : (
           budgets.map((budget) => {
             const isOver = budget.percentage >= 100;
             return (
               <div key={budget.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  
                  {/* Background Progress (Visual Halus) */}
                  <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${getProgressColor(budget.percentage)}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>

                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          {/* Dot Warna Kategori */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: budget.category.color }}>
                             {budget.category.name.charAt(0)}
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800">{budget.category.name}</h3>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                              </p>
                          </div>
                      </div>
                      
                      {/* Badge Persentase */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOver ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {budget.percentage}%
                      </span>
                  </div>

                  {/* Progress Bar Utama */}
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)} ${isOver ? 'animate-pulse' : ''}`} 
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                  </div>

                  {/* Stats Angka */}
                  <div className="flex justify-between items-end mb-6">
                      <div>
                          <p className="text-xs text-gray-400 mb-0.5">Terpakai</p>
                          <p className={`font-bold text-lg ${isOver ? 'text-red-600' : 'text-gray-700'}`}>
                            {formatRupiah(budget.spent)}
                          </p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">Sisa Limit</p>
                          <p className="font-bold text-sm text-gray-500">
                            {formatRupiah(budget.remaining < 0 ? 0 : budget.remaining)}
                          </p>
                      </div>
                  </div>

                  {/* Action Buttons (Muncul saat Hover) */}
                  <div className="flex gap-2 border-t border-gray-50 pt-4">
                      <button 
                        onClick={() => handleEdit(budget)}
                        className="flex-1 py-2 rounded-xl bg-gray-50 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(budget.id)}
                        className="flex-1 py-2 rounded-xl bg-gray-50 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiTrash2 /> Hapus
                      </button>
                  </div>

               </div>
             )
           })
        )}
      </div>

      {/* MODALS */}
      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchBudgets} editData={editData} />
      
      <ConfirmModal 
        isOpen={confirmData.isOpen} 
        onClose={() => setConfirmData({...confirmData, isOpen: false})} 
        onConfirm={executeDelete}
        title="Hapus Anggaran?"
        message="Data anggaran ini akan dihapus. Riwayat transaksi tidak akan terpengaruh."
        type="danger"
      />

      <AlertModal 
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({...alertData, isOpen: false})}
        title="Gagal"
        message={alertData.message}
      />

    </MainLayout>
  );
}