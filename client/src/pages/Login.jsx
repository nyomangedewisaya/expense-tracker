import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-blue-500 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-gray-500 mt-2">Masuk untuk mengelola keuangan Anda</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              Masuk Sekarang
            </Button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-800">
            Daftar disini
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default Login;