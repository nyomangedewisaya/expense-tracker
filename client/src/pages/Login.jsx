import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { FiHexagon } from 'react-icons/fi';

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
      setError(err.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-tech-pattern p-4 font-sans">
      
      <Card className="w-full max-w-md animate-fade-in-up border-t-4 border-t-blue-600 shadow-2xl shadow-blue-100/50">
        <div className="text-center mb-8 pt-2">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FiHexagon className="text-5xl" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className={`transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <form onSubmit={handleSubmit}>
              <Input 
                label="Email"
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <div className="mb-2">
                <Input 
                    label="Password"
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end mb-3">
                 <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    Forgot Password?
                 </Link>
              </div>
              
              <Button type="submit" fullWidth isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
        </div>
      </Card>
      
      <div className="absolute bottom-6 text-center text-xs text-gray-400">
        © 2025 Expense Tracker. All rights reserved.
      </div>
    </div>
  );
};

export default Login;