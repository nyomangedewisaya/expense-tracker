import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-blue-500 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Buat Akun Baru</h1>
          <p className="text-gray-500 mt-2">Mulai perjalanan finansial Anda</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Nama Lengkap" 
            placeholder="Budi Santoso"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="mt-6">
            <Button type="submit" fullWidth isLoading={loading}>
              Daftar Akun
            </Button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-800">
            Login disini
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default Register;