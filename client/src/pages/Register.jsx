import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import AlertModal from '../components/AlertModal'; // 1. Import AlertModal
import { FiTrendingUp } from 'react-icons/fi';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. State untuk kontrol Modal Sukses
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      
      // 3. JANGAN alert() dan JANGAN langsung navigate()
      // Tampilkan modal sukses dulu
      setIsSuccessOpen(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Fungsi handle ketika user klik tombol "Mengerti" di modal / tutup modal
  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
    navigate('/login'); // Baru pindah ke login disini
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-tech-pattern p-4 font-sans">
      
      <Card className="w-full max-w-md animate-fade-in-up border-t-4 border-t-blue-600 shadow-2xl shadow-blue-100/50">
        
        <div className="text-center mb-8 pt-2">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FiTrendingUp className="text-5xl" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">Start managing your finances today.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className={`transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <form onSubmit={handleSubmit}>
              <Input 
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input 
                label="Email"
                type="email" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                label="Password"
                type="password" 
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <div className="mt-6">
                <Button type="submit" fullWidth isLoading={loading}>
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Log in
                </Link>
              </p>
            </div>
        </div>
      </Card>

      {/* 5. Render Modal Alert */}
      <AlertModal 
        isOpen={isSuccessOpen}
        onClose={handleCloseSuccess} // Panggil fungsi redirect saat ditutup
        title="Registrasi Berhasil!"
        message="Akun Anda telah berhasil dibuat. Silakan login untuk mulai mengelola keuangan Anda."
        type="success" // Agar warnanya hijau (checklist)
      />

    </div>
  );
};

export default Register;