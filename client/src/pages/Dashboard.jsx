import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  FiTrendingUp, FiCreditCard, FiArrowRight, FiPlus, 
  FiActivity, FiPieChart, FiEye, FiEyeOff, FiTarget 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({ total_balance: 0, income_this_month: 0, expense_this_month: 0 });
  const [recentTrx, setRecentTrx] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]); 
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const formatDate = (date) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(date));
  const privacyMask = (amount) => showBalance ? formatRupiah(amount) : '••••••••';

  const getProgressColor = (percent) => {
    if (percent < 50) return 'bg-emerald-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const fetchData = async () => {
    try {
      setLoading(true); 
      
      const [resSummary, resTrx, resWallets, resBudgets, resExpenses] = await Promise.all([
        api.get('/dashboard'),           
        api.get('/transactions'),        
        api.get('/wallets'),             
        api.get('/budgets'),             
        api.get('/dashboard/expenses')   
      ]);

      setSummary(resSummary.data);
      setRecentTrx(resTrx.data.slice(0, 5));
      setWallets(resWallets.data); 
      setBudgets(resBudgets.data); 
      setExpenseStats(resExpenses.data);

    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const fetchChart = async () => {
    try {
        const res = await api.get(`/dashboard/chart?period=${chartPeriod}`);
        setChartData(res.data);
    } catch (error) {
        console.error("Gagal chart:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchChart(); }, [chartPeriod]);

  return (
    <MainLayout>
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {loading ? (
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-[280px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <div className="space-y-4">
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-12 w-64 rounded-lg" />
                             </div>
                             <Skeleton className="h-12 w-40 rounded-xl" />
                        </div>
                        <div className="flex gap-4 mt-6">
                             <div className="w-40 h-16 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                 <Skeleton className="w-8 h-8 rounded-full" />
                                 <div className="space-y-2">
                                     <Skeleton className="h-2 w-16 rounded" />
                                     <Skeleton className="h-4 w-20 rounded" />
                                 </div>
                             </div>
                             <div className="w-40 h-16 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                 <Skeleton className="w-8 h-8 rounded-full" />
                                 <div className="space-y-2">
                                     <Skeleton className="h-2 w-16 rounded" />
                                     <Skeleton className="h-4 w-20 rounded" />
                                 </div>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden transition-all duration-500 hover:shadow-2xl h-[280px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1 w-full md:w-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-blue-100 text-sm font-medium tracking-wide">Total Aset Keuangan</p>
                                    <button onClick={() => setShowBalance(!showBalance)} className="text-blue-200 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                                        {showBalance ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                                    {privacyMask(summary.total_balance)}
                                </h1>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300"><FiTrendingUp /></div>
                                        <div>
                                            <p className="text-[10px] text-blue-200 uppercase font-bold">Pemasukan</p>
                                            <p className="text-sm font-bold">+{privacyMask(summary.income_this_month)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-300"><FiTrendingUp className="rotate-180" /></div>
                                        <div>
                                            <p className="text-[10px] text-blue-200 uppercase font-bold">Pengeluaran</p>
                                            <p className="text-sm font-bold">-{privacyMask(summary.expense_this_month)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => navigate('/transactions')} className="!bg-white !text-blue-700 hover:!bg-blue-50 border-none shadow-lg shadow-blue-900/20 py-3 px-6 whitespace-nowrap flex items-center gap-2 shrink-0">
                                <FiPlus className="text-lg mr-2" /> 
                                <span>Transaksi Baru</span>
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <Card className="!p-6 border-none shadow-lg h-[350px]">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-40 rounded" />
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                        <div className="h-64 w-full bg-gray-50 rounded-xl relative overflow-hidden">
                             <div className="absolute bottom-0 left-0 w-full h-32 bg-gray-200 opacity-50 rounded-b-xl clip-path-polygon"></div>
                             <Skeleton className="w-full h-full opacity-20" />
                        </div>
                    </Card>
                ) : (
                    <Card className="!p-6 border-none shadow-lg h-[350px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiActivity className="text-blue-500" /> Analisis Arus Kas
                            </h3>
                            <select 
                                value={chartPeriod}
                                onChange={(e) => setChartPeriod(e.target.value)}
                                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer text-gray-600 font-medium"
                            >
                                <option value="7days">7 Hari</option>
                                <option value="month">Bulan Ini</option>
                            </select>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} interval="preserveStartEnd" />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => [privacyMask(value), '']}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}

                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Riwayat Transaksi</h3>
                        <a href="/transactions" className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium">
                            Lihat Semua <FiArrowRight />
                        </a>
                    </div>
                    
                    <Card className="!p-0 overflow-hidden shadow-sm border border-gray-100">
                        {loading ? (
                            <div className="divide-y divide-gray-50">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex justify-between items-center p-5">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32 rounded" />
                                                <Skeleton className="h-3 w-20 rounded" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-24 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : recentTrx.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">Belum ada transaksi.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Keterangan</th>
                                        <th className="px-6 py-3 hidden md:table-cell">Kategori</th>
                                        <th className="px-6 py-3 text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentTrx.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-700 text-sm group-hover:text-blue-600">{trx.description}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    {formatDate(trx.transaction_date)} • <span className="bg-gray-100 px-1.5 rounded text-[10px]">{trx.wallet.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                                    ${trx.category.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}
                                                `}>
                                                    {trx.category.name}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold text-sm ${trx.category.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {trx.category.type === 'income' ? '+' : '-'} {privacyMask(trx.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>
            </div>

            <div className="space-y-8">
                
                {loading ? (
                    <Card className="!bg-gray-900 !border-none shadow-xl h-[400px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-32 bg-gray-700 rounded" />
                            <Skeleton className="h-5 w-16 bg-gray-700 rounded" />
                        </div>
                        <div className="space-y-4 flex-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                    <div className="flex justify-between mb-2">
                                        <Skeleton className="h-4 w-24 bg-gray-700 rounded" />
                                        <Skeleton className="h-4 w-12 bg-gray-700 rounded" />
                                    </div>
                                    <Skeleton className="h-6 w-32 bg-gray-600 rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <Skeleton className="h-12 w-full bg-gray-700 rounded-xl" />
                        </div>
                    </Card>
                ) : (
                    <Card className="!bg-gray-900 !text-white !border-none shadow-xl relative overflow-hidden ring-1 ring-white/10 flex flex-col h-[400px]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center mb-4 relative z-10 shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2"><FiCreditCard /> Dompet Saya</h3>
                            <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-lg border border-white/5">
                                {wallets.length} Akun
                            </span>
                        </div>

                        <div className="space-y-3 relative z-10 overflow-y-auto pr-1 custom-scrollbar flex-1">
                            {wallets.map((wallet) => {
                                const isActive = !wallet.deleted_at;
                                return (
                                    <div 
                                        key={wallet.id} 
                                        onClick={() => navigate('/wallets')} 
                                        className={`p-4 rounded-xl backdrop-blur-md border transition-all cursor-pointer group
                                            ${isActive 
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                                                : 'bg-black/20 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                {!isActive && <span className="text-[9px] font-bold text-red-300 uppercase tracking-wider mb-0.5">Nonaktif</span>}
                                                <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-gray-200 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{wallet.name}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase whitespace-nowrap ${wallet.type === 'bank' ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' : wallet.type === 'ewallet' ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' }`}>{wallet.type}</span>
                                        </div>
                                        <div className={`text-lg font-bold tracking-wide ${!isActive && 'text-gray-400 group-hover:text-white transition-colors'}`}>{privacyMask(wallet.current_balance)}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="pt-4 mt-auto relative z-10">
                            <button onClick={() => navigate('/wallets')} className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-all flex justify-center items-center gap-2 hover:bg-white/5">
                                <FiPlus /> Tambah Dompet
                            </button>
                        </div>
                    </Card>
                )}

                {loading ? (
                    <Card className="border-none shadow-md">
                        <div className="flex items-center gap-2 mb-6">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-32 rounded" />
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <Skeleton className="h-4 w-20 rounded" />
                                        <Skeleton className="h-4 w-10 rounded" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                    <div className="flex justify-between mt-2">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-3 w-16 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Card className="border-none shadow-md">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                            <FiTarget className="text-blue-500"/> Limit Anggaran
                        </h3>
                        {budgets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 mb-3">Belum ada anggaran diatur.</p>
                                <Button onClick={() => navigate('/budgets')} className="text-xs !py-1.5 !px-3 shadow-none">Buat Sekarang</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {budgets.map((budget) => (
                                    <div key={budget.id} className="group">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-gray-700">{budget.category.name}</span>
                                            <span className={`font-bold ${budget.percentage >= 80 ? 'text-red-500' : 'text-gray-600'}`}>{budget.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                            <div className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors">
                                            <span>{privacyMask(budget.spent)}</span>
                                            <span>Limit: {privacyMask(budget.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {loading ? (
                    <Card className="border-none shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-6 w-32 rounded" />
                        </div>
                        <Skeleton className="h-3 w-40 rounded mb-4" />
                        <div className="flex justify-center mb-6">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-3 w-24 rounded" />
                                    </div>
                                    <Skeleton className="h-3 w-16 rounded" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Card className="border-none shadow-md">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <FiPieChart className="text-purple-500" /> Pengeluaran
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Berdasarkan kategori bulan ini</p>
                        
                        {expenseStats.length === 0 ? (
                             <div className="text-center py-10 text-gray-400 text-xs">Belum ada pengeluaran bulan ini.</div>
                        ) : (
                            <>
                                <div className="h-40 w-full relative mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={expenseStats} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                                {expenseStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#94a3b8'} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val) => privacyMask(val)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {expenseStats.map((item) => (
                                        <div key={item.name} className="flex justify-between items-center text-xs border-b border-dashed border-gray-100 last:border-0 pb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: item.color || '#94a3b8'}}></div>
                                                <span className="text-gray-600 font-medium truncate w-24">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-700">{privacyMask(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                )}
            </div>
        </div>
    </MainLayout>
  );
};

export default Dashboard;