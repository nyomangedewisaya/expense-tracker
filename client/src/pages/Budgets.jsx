import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import api from '../api';
import { FiPlus, FiTarget, FiEdit2, FiTrash2 } from 'react-icons/fi';

const BudgetSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse h-[240px] flex flex-col justify-between">
    <div>
        <div className="flex justify-between mb-6">
            <div className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full mb-6"></div>
        <div className="flex justify-between">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
    </div>
    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
        <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
        <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [alertData, setAlertData] = useState({ isOpen: false, message: '' });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-600';
    if (percent >= 80) return 'bg-red-500';  
    if (percent >= 50) return 'bg-yellow-500'; 
    return 'bg-emerald-500'; 
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            Anggaran Saya
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Batasi pengeluaran agar keuangan tetap sehat.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
        >
          <FiPlus size={20} /> Buat Anggaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [...Array(6)].map((_, i) => <BudgetSkeleton key={i} />)
        ) : budgets.length === 0 ? (
           <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-4"><FiTarget /></div>
                <h3 className="text-lg font-bold text-gray-700">Belum ada anggaran</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-xs">Buat anggaran bulanan atau mingguan untuk kategori tertentu.</p>
                <button onClick={handleCreate} className="text-blue-600 font-semibold hover:underline">Buat Sekarang</button>
           </div>
        ) : (
           budgets.map((budget) => {
             const isOver = budget.percentage >= 100;
             return (
               <div key={budget.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between h-full">
                  
                  <div className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ${getProgressColor(budget.percentage)}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>

                  <div>
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: budget.category.color }}>
                                 {budget.category.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{budget.category.name}</h3>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mt-0.5">
                                    {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                                  </p>
                              </div>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOver ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                            {budget.percentage}%
                          </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden shadow-inner relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)}`} 
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          ></div>
                          <div className="absolute top-0 bottom-0 w-0.5 bg-white right-[20%] z-10 opacity-30"></div>
                      </div>

                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <p className="text-xs text-gray-400 font-medium mb-1">Terpakai</p>
                              <p className={`font-bold text-lg md:text-xl ${isOver ? 'text-red-600' : 'text-gray-800'}`}>
                                {formatRupiah(budget.spent)}
                              </p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-gray-400 font-medium mb-1">Sisa Limit</p>
                              <p className="font-bold text-sm text-gray-500">
                                {formatRupiah(budget.remaining < 0 ? 0 : budget.remaining)}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-2 border-t border-gray-50 pt-4 mt-auto">
                      <button 
                        onClick={() => handleEdit(budget)}
                        className="flex-1 py-2.5 rounded-xl bg-gray-50 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-50/50"
                      >
                        <FiEdit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(budget.id)}
                        className="flex-1 py-2.5 rounded-xl bg-gray-50 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 group-hover:bg-red-50/50"
                      >
                        <FiTrash2 size={14} /> Hapus
                      </button>
                  </div>

               </div>
             )
           })
        )}
      </div>

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