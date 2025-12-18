import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { FiSearch, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();

      if (keyword.includes('dompet') || keyword.includes('wallet') || keyword.includes('saldo')) {
          navigate('/wallets');
      } 
      else if (keyword.includes('kategori') || keyword.includes('category') || keyword.includes('label')) {
          navigate('/categories');
      }
      else if (keyword.includes('anggaran') || keyword.includes('budget') || keyword.includes('limit')) {
          navigate('/budgets');
      }
      else if (keyword.includes('transfer') || keyword.includes('kirim') || keyword.includes('pindah')) {
          navigate('/transfers');
      }
      else if (keyword.includes('setting') || keyword.includes('pengaturan') || keyword.includes('profil') || keyword.includes('password')) {
          navigate('/settings');
      }
      else {
          navigate(`/transactions?q=${encodeURIComponent(searchTerm)}`);
      }
      
      setSearchTerm(''); 
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <FiMenu size={24} />
            </button>
            
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                {getGreeting()} 👋
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Semoga harimu menyenangkan!</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    className="bg-gray-100 text-gray-600 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 pl-10 pr-4 text-sm w-32 md:w-64 transition-all outline-none" 
                />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;