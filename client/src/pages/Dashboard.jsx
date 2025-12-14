import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { FiLogOut, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi'; // Pastikan install react-icons

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [summary, setSummary] = useState({ total_balance: 0, income_this_month: 0, expense_this_month: 0 });
  const [recentTrx, setRecentTrx] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium', 
      timeStyle: 'short',  
    }).format(date);
  };

  const fetchData = async () => {
    try {
      const [resSummary, resTrx] = await Promise.all([
        api.get('/dashboard'),
        api.get('/transactions')
      ]);

      setSummary(resSummary.data);
      setRecentTrx(resTrx.data.slice(0, 5)); 
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary-600">ExpenseTracker</h1>
            <p className="text-xs text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span></p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <FiCreditCard className="text-2xl" />
              </div>
              <p className="text-blue-100 text-sm font-medium">Total Saldo</p>
            </div>
            <h2 className="text-3xl font-bold">
              {loading ? "..." : formatRupiah(summary.total_balance)}
            </h2>
          </div>

          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <FiTrendingUp />
              </div>
              <p className="text-gray-500 text-sm">Pemasukan (Bulan Ini)</p>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : formatRupiah(summary.income_this_month)}
            </h2>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <FiTrendingDown />
              </div>
              <p className="text-gray-500 text-sm">Pengeluaran (Bulan Ini)</p>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : formatRupiah(summary.expense_this_month)}
            </h2>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h3>
          <Button className="text-sm px-4 py-2">Tambah Transaksi</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : recentTrx.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada transaksi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Dompet</th>
                    <th className="px-6 py-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTrx.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(trx.transaction_date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {trx.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${trx.category.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {trx.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {trx.wallet.name}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap
                        ${trx.category.type === 'income' ? 'text-emerald-600' : 'text-red-600'}
                      `}>
                        {trx.category.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </main>
    </div>
  );
};

export default Dashboard;