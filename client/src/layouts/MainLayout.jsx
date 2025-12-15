import Sidebar from '../components/Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiSearch } from 'react-icons/fi';

const MainLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Fungsi Sapaan Waktu Indonesia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Wrapper Konten Utama */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        
        {/* --- HEADER --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 flex items-center justify-between">
          
          {/* Kiri: Sapaan */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {getGreeting()}, <span className="text-blue-600">{user?.name?.split(' ')[0]}</span> 👋
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Berikut ringkasan keuanganmu hari ini.</p>
          </div>

          {/* Kanan: Aksi */}
          <div className="flex items-center gap-4">
            {/* Search Bar Kecil */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch className="text-gray-400" />
                <input type="text" placeholder="Cari data..." className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 placeholder-gray-400" />
            </div>

            {/* Notifikasi */}
            <button className="relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
               <FiBell className="text-lg" />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Avatar Profil */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 cursor-pointer hover:shadow-lg hover:shadow-blue-200 transition-all">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
          </div>
        </header>

        {/* --- KONTEN HALAMAN --- */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Animasi Masuk */}
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;