import { useEffect, useState, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import WalletModal from '../components/WalletModal';
import ConfirmModal from '../components/ConfirmModal'; 
import api from '../api';
import { FiPlus, FiCreditCard, FiSmartphone, FiDollarSign, FiMoreVertical, FiEye, FiEyeOff, FiPower, FiRefreshCw } from 'react-icons/fi';

// --- SKELETON LOADER ---
const CardSkeleton = () => (
  <div className="relative w-full h-48 rounded-3xl overflow-hidden bg-gray-200">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
  </div>
);

// --- COMPONENT: WALLET MENU (DENGAN ANIMASI SMOOTH) ---
const WalletMenu = ({ isActive, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);       // Logic Buka/Tutup
  const [isMounted, setIsMounted] = useState(false); // Logic DOM (Ada/Tiada)
  const [animate, setAnimate] = useState(false);     // Logic CSS (Terlihat/Transparan)
  
  const menuRef = useRef(null);

  // 1. Handle Click Outside (Tutup jika klik di luar)
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // 2. Fungsi Buka (Mount dulu -> Delay -> Animate)
  const handleOpen = () => {
    setIsOpen(true);
    setIsMounted(true);
    setTimeout(() => setAnimate(true), 10);
  };

  // 3. Fungsi Tutup (Animate balik -> Delay -> Unmount)
  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setIsOpen(false);
      setIsMounted(false);
    }, 200); // Sesuai durasi CSS (duration-200)
  };

  const toggleMenu = () => {
    if (isOpen) handleClose();
    else handleOpen();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className={`p-2 rounded-full transition-all duration-300
          ${isOpen ? 'bg-white/20 text-white rotate-90' : 'text-white/70 hover:text-white hover:bg-white/10'}
        `}
      >
        <FiMoreVertical size={20} />
      </button>

      {/* Dropdown Content */}
      {isMounted && (
        <div 
          className={`
            absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl overflow-hidden py-1 z-20 
            origin-top-right border border-gray-100
            transform transition-all duration-200 ease-out
            ${animate 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
          `}
        >
          {/* Header Kecil */}
          <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opsi Dompet</span>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => { handleClose(); onToggle(); }}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-colors
              ${isActive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-emerald-600 hover:bg-emerald-50'}
            `}
          >
            {isActive ? (
              <>
                <div className="p-1.5 bg-red-100 rounded-lg"><FiPower size={14} /></div>
                <span>Nonaktifkan</span>
              </>
            ) : (
              <>
                <div className="p-1.5 bg-emerald-100 rounded-lg"><FiRefreshCw size={14} /></div>
                <span>Aktifkan Kembali</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ isOpen: false, wallet: null });
  
  const [showBalance, setShowBalance] = useState(true);

  // Helper Formatter
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const privacyMask = (amount) => showBalance ? formatRupiah(amount) : '••••••••';

  // Helper Style
  const getWalletStyle = (type) => {
    switch(type) {
      case 'bank': return { bg: 'bg-gradient-to-br from-blue-600 to-indigo-700', icon: <FiCreditCard className="text-2xl" />, label: 'Bank Account' };
      case 'ewallet': return { bg: 'bg-gradient-to-br from-purple-600 to-pink-600', icon: <FiSmartphone className="text-2xl" />, label: 'E-Wallet' };
      case 'cash': return { bg: 'bg-gradient-to-br from-emerald-500 to-teal-700', icon: <FiDollarSign className="text-2xl" />, label: 'Cash / Tunai' };
      default: return { bg: 'bg-gradient-to-br from-gray-600 to-gray-800', icon: <FiCreditCard className="text-2xl" />, label: 'Lainnya' };
    }
  };

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallets'); 
      setWallets(res.data);
    } catch (error) {
      console.error("Gagal load wallet", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => { fetchWallets(); }, []);

  // SORTING: Nonaktif selalu di bawah
  const sortedWallets = [...wallets].sort((a, b) => {
    if (a.deleted_at === b.deleted_at) return 0;
    return a.deleted_at ? 1 : -1;
  });

  // Action: Confirm Modal
  const handleToggleClick = (wallet) => {
    const isActive = !wallet.deleted_at;
    setConfirmData({
      isOpen: true,
      wallet: wallet,
      title: isActive ? 'Nonaktifkan Dompet?' : 'Aktifkan Dompet?',
      message: isActive 
        ? `Dompet "${wallet.name}" akan disembunyikan dari pilihan transaksi.` 
        : `Dompet "${wallet.name}" akan kembali aktif dan bisa digunakan.`,
      type: isActive ? 'danger' : 'success'
    });
  };

  // Action: Execute API
  const executeToggleStatus = async () => {
    if (!confirmData.wallet) return;
    try {
      await api.patch(`/wallets/${confirmData.wallet.id}/status`);
      fetchWallets();
    } catch (error) {
      alert("Gagal update status");
    }
  };

  const totalAssets = wallets.filter(w => !w.deleted_at).reduce((acc, curr) => acc + (curr.current_balance || 0), 0);

  return (
    <MainLayout>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dompet Saya</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">Total aset aktif:</p>
            <div className="flex items-center gap-2">
               <span className="text-lg font-bold text-gray-800">{privacyMask(totalAssets)}</span>
               <button onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-blue-600 transition-colors">
                 {showBalance ? <FiEyeOff size={16} /> : <FiEye size={16} />}
               </button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
        >
          <FiPlus size={20} /> Tambah Dompet
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {loading ? (
          [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
        ) : sortedWallets.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-4"><FiCreditCard /></div>
            <h3 className="text-lg font-bold text-gray-700">Belum ada dompet</h3>
            <button onClick={() => setIsCreateOpen(true)} className="text-blue-600 font-semibold hover:underline mt-2">Buat Dompet Baru</button>
          </div>
        ) : (
          sortedWallets.map((wallet) => {
            const style = getWalletStyle(wallet.type);
            const isActive = !wallet.deleted_at;

            return (
              <div 
                key={wallet.id}
                className={`relative h-52 rounded-3xl p-6 text-white shadow-xl shadow-gray-200 overflow-hidden group transition-all duration-300
                  ${style.bg}
                  ${!isActive ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : 'hover:shadow-2xl'}
                `}
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                  
                  {/* CARD HEADER */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white/90">
                        {style.icon}
                      </div>
                      <div>
                         {!isActive && <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white font-bold tracking-wider mb-0.5 block w-fit backdrop-blur-md">NONAKTIF</span>}
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{wallet.name}</h3>
                      </div>
                    </div>
                    
                    {/* MENU TITIK TIGA DENGAN ANIMASI */}
                    <WalletMenu 
                      isActive={isActive} 
                      onToggle={() => handleToggleClick(wallet)} 
                    />
                  </div>

                  {/* CARD FOOTER (Saldo & Tipe Sejajar) */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/70 font-medium mb-1 uppercase tracking-wide">Saldo Aktif</p>
                      <h2 className="text-2xl font-bold tracking-tight truncate max-w-[180px]">
                        {privacyMask(wallet.current_balance)}
                      </h2>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {wallet.type}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      <WalletModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchWallets} 
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        onConfirm={executeToggleStatus}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
      />

    </MainLayout>
  );
}