import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Pastikan sudah install react-icons

const Input = ({ label, type = "text", placeholder, value, onChange, error }) => {
  // State untuk toggle password (hanya aktif jika type="password")
  const [showPassword, setShowPassword] = useState(false);
  
  // Cek apakah ini input password?
  const isPasswordField = type === 'password';

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          // Jika ini field password, cek state showPassword. Jika bukan, pakai type aslinya.
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          
          className={`w-full pl-4 ${isPasswordField ? 'pr-12' : 'pr-4'} py-3 rounded-lg border text-gray-700 bg-white placeholder-gray-400 shadow-sm transition-all duration-300 ease-in-out
            ${error 
              ? 'border-red-400 focus:ring-4 focus:ring-red-100 focus:border-red-500' 
              : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none'
            }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        {/* Tombol Mata (Hanya muncul di field password) */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
            tabIndex="-1" // Agar tidak bisa di-tab (fokus tetap di input)
          >
            {showPassword ? (
              <FiEyeOff size={20} /> // Icon Mata Silang (Hide)
            ) : (
              <FiEye size={20} />    // Icon Mata Biasa (Show)
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center animate-pulse">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default Input;