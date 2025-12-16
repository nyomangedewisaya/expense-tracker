import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../api';
import AlertModal from '../components/AlertModal';
import { FiUser, FiLock, FiSave, FiCheckCircle, FiSettings } from 'react-icons/fi';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Hapus state 'user' jika tidak dipakai di UI lain, fokus ke form saja
  // Inisialisasi dengan string kosong agar tidak error "uncontrolled component"
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '' });

  // 1. FETCH DATA (DENGAN DEBUGGING)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        console.log("Data User:", res.data); // Cek Console browser: apakah data masuk?
        
        // Pastikan set state hanya jika data ada
        if (res.data) {
            setProfileForm({ 
                name: res.data.name || '', 
                email: res.data.email || '' 
            });
        }
      } catch (err) { 
        console.error("Gagal ambil profil:", err); 
        // Jika token expired/error, opsional: redirect ke login
      }
    };
    fetchProfile();
  }, []);

  // 2. HANDLE UPDATE (PERBAIKAN ERROR HANDLING)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Kirim data ke backend
      const res = await api.put('/user/profile', {
        name: profileForm.name,
        email: profileForm.email
      });
      
      setAlertData({ isOpen: true, title: "Berhasil", message: res.data.message });
      
      // Opsional: Update localStorage jika menyimpan nama user disana
      // const userLocal = JSON.parse(localStorage.getItem('user'));
      // localStorage.setItem('user', JSON.stringify({ ...userLocal, name: profileForm.name }));
      
    } catch (error) {
      console.error("Error Update:", error);
      setAlertData({ 
          isOpen: true, 
          title: "Gagal", 
          message: error.response?.data?.message || "Terjadi kesalahan server" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
        setAlertData({ isOpen: true, title: "Error", message: "Konfirmasi password baru tidak cocok." });
        return;
    }
    setLoading(true);
    try {
      await api.put('/user/password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setAlertData({ isOpen: true, title: "Berhasil", message: "Password berhasil diubah. Silakan login ulang nanti." });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setAlertData({ isOpen: true, title: "Gagal", message: error.response?.data?.message || "Gagal ubah password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Pengaturan
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola profil akun dan keamanan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SIDEBAR TABS (Kiri) */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}
                    `}
                >
                    <FiUser size={18} /> Profil Saya
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}
                    `}
                >
                    <FiLock size={18} /> Keamanan (Password)
                </button>
            </div>
        </div>

        {/* CONTENT AREA (Kanan) */}
        <div className="lg:col-span-2">
            
            {/* TAB: PROFIL */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Edit Profil</h2>
                    <p className="text-sm text-gray-400 mb-6">Perbarui informasi data diri Anda.</p>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={profileForm.name || ''}
                                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alamat Email</label>
                                <input 
                                    type="email" 
                                    value={profileForm.email || ''}
                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                            >
                                {loading ? 'Menyimpan...' : <><FiSave /> Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Ganti Password</h2>
                    <p className="text-sm text-gray-400 mb-6">Pastikan password Anda kuat dan aman.</p>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password Lama</label>
                            <input 
                                type="password" 
                                required
                                value={passwordForm.old_password}
                                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password Baru</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                            >
                                {loading ? 'Memproses...' : <><FiCheckCircle /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
      </div>

      <AlertModal 
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({...alertData, isOpen: false})}
        title={alertData.title}
        message={alertData.message}
      />
    </MainLayout>
  );
}