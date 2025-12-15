import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import TransactionModal from '../components/TransactionModal';
import FilterModal from '../components/FilterModal';
import CustomSelect from '../components/CustomSelect'; 
import api from '../api';
import { FiPlus, FiSearch, FiTrash2, FiCalendar, FiFilter, FiRefreshCw, FiX } from 'react-icons/fi';

// --- SKELETON LOADER ---
const TableSkeleton = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="p-4 w-12 text-center"><div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mb-2"></div><div className="h-3 w-20 bg-gray-100 rounded"></div></td>
    <td className="p-4"><div className="h-6 w-24 bg-gray-200 rounded-full"></div></td>
    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
    <td className="p-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div></td>
  </tr>
);

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);       
  const [isFilterOpen, setIsFilterOpen] = useState(false);     

  // Options Data
  const [walletOptions, setWalletOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // --- STATE FILTER ---
  const [filters, setFilters] = useState({
    wallet_id: '', category_id: '', type: '', start_date: '', end_date: '', search: ''
  });

  // Filter Sementara (Temp) untuk Modal
  const [tempFilters, setTempFilters] = useState(filters);

  // Helpers
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // Load Options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [resWallets, resCats] = await Promise.all([api.get('/wallets'), api.get('/categories')]);
        setWalletOptions(resWallets.data.map(w => ({ value: w.id, label: w.name })));
        setCategoryOptions(resCats.data.map(c => ({ value: c.id, label: c.name, color: c.color })));
      } catch (err) { console.error("Gagal load options", err); }
    };
    loadOptions();
  }, []);

  // Fetch API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach(key => { if (filters[key]) params[key] = filters[key]; });

      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]); 

  // --- HANDLERS FILTER ---
  const openFilterModal = () => {
    setTempFilters(filters);
    setIsFilterOpen(true);
  };

  const applyFilter = () => {
    setFilters(tempFilters);
  };

  const resetTempFilter = () => {
    setTempFilters({ ...tempFilters, wallet_id: '', category_id: '', type: '', start_date: '', end_date: '' });
  };

  const handleResetAll = () => {
    const empty = { wallet_id: '', category_id: '', type: '', start_date: '', end_date: '', search: '' };
    setFilters(empty);
    setTempFilters(empty);
  };

  const handleSearchSubmit = (e) => { if(e.key === 'Enter') fetchTransactions(); }

  const typeOptions = [
    { value: 'income', label: 'Pemasukan', color: '#10B981' },
    { value: 'expense', label: 'Pengeluaran', color: '#EF4444' }
  ];

  const isFilterActive = filters.wallet_id || filters.category_id || filters.type || filters.start_date || filters.end_date;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau riwayat keuanganmu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <FiPlus size={18} /> Transaksi Baru
        </button>
      </div>

      {/* FILTER BAR SIMPLE */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            onKeyDown={handleSearchSubmit}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
          />
          {filters.search && (
            <button onClick={() => setFilters({...filters, search: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"><FiX /></button>
          )}
        </div>

        {/* Tombol Buka Filter Modal */}
        <button 
          onClick={openFilterModal}
          className={`px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all border ${isFilterActive ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <FiFilter size={16} /> Filter
          {isFilterActive && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>}
        </button>

        {/* Reset All */}
        <button onClick={handleResetAll} className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-100">
          <FiRefreshCw size={18} />
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100">
                <th className="p-5 w-16 text-center">No</th>
                <th className="p-5">Tanggal</th>
                <th className="p-5">Keterangan</th>
                <th className="p-5">Kategori</th>
                <th className="p-5">Dompet</th>
                <th className="p-5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => <TableSkeleton key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🔍</div>
                      <div>
                        <p className="font-bold text-gray-800">Tidak ada transaksi ditemukan</p>
                        <button onClick={handleResetAll} className="text-blue-600 text-sm font-medium hover:underline mt-2">Reset Filter</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((trx, index) => (
                  <tr key={trx.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5 text-center text-gray-400 font-medium text-xs">{index + 1}</td>
                    <td className="p-5 whitespace-nowrap"><div className="flex items-center gap-2 text-gray-600"><FiCalendar className="text-gray-300" /><span className="font-medium">{formatDate(trx.transaction_date)}</span></div></td>
                    <td className="p-5"><div className="font-semibold text-gray-700 line-clamp-1">{trx.description || '-'}</div></td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold capitalize border" style={{ borderColor: trx.category?.color ? `${trx.category.color}40` : '#cbd5e1', color: trx.category?.color || '#64748b', backgroundColor: trx.category?.color ? `${trx.category.color}10` : '#f8fafc' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trx.category?.color || '#cbd5e1' }}></span>{trx.category?.name}
                      </span>
                    </td>
                    <td className="p-5"><span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200">{trx.wallet?.name}</span></td>
                    <td className={`p-5 font-bold whitespace-nowrap text-base text-right ${trx.category.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>{trx.category.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GLOBAL FILTER MODAL */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Transaksi"
        onReset={resetTempFilter}
        onApply={applyFilter}
      >
        <div className="space-y-4">
          <CustomSelect 
            label="Dompet" placeholder="Semua Dompet" options={walletOptions}
            value={tempFilters.wallet_id} onChange={(val) => setTempFilters({...tempFilters, wallet_id: val})}
            onClear={() => setTempFilters({...tempFilters, wallet_id: ''})}
          />
          <CustomSelect 
            label="Kategori" placeholder="Semua Kategori" options={categoryOptions}
            value={tempFilters.category_id} onChange={(val) => setTempFilters({...tempFilters, category_id: val})}
            onClear={() => setTempFilters({...tempFilters, category_id: ''})}
          />
          <CustomSelect 
            label="Tipe Transaksi" placeholder="Semua Tipe" options={typeOptions}
            value={tempFilters.type} onChange={(val) => setTempFilters({...tempFilters, type: val})}
            onClear={() => setTempFilters({...tempFilters, type: ''})}
          />
          
          {/* RENTANG TANGGAL - NORMAL (STANDARD HTML DATE INPUT) */}
          {/* Ini adalah solusi paling stabil. Tidak ada trik CSS aneh-aneh. */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Rentang Tanggal</label>
            <div className="grid grid-cols-2 gap-3">
              
              <div>
                <label className="text-[10px] text-gray-400 font-semibold ml-1 mb-1 block">Mulai</label>
                <input 
                  type="date"
                  value={tempFilters.start_date} 
                  onChange={(e) => setTempFilters({...tempFilters, start_date: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold ml-1 mb-1 block">Selesai</label>
                <input 
                  type="date"
                  value={tempFilters.end_date} 
                  onChange={(e) => setTempFilters({...tempFilters, end_date: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>
      </FilterModal>

      {/* CREATE MODAL */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTransactions} />
    </MainLayout>
  );
}