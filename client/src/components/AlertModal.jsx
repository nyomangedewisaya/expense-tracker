import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertOctagon, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'error' 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const styles = {
    success: {
      iconBg: 'bg-emerald-50 text-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
      icon: <FiCheckCircle size={32} />
    },
    error: {
      iconBg: 'bg-red-50 text-red-500',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
      icon: <FiAlertOctagon size={32} />
    },
    info: {
      iconBg: 'bg-blue-50 text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
      icon: <FiInfo size={32} />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out
          ${animate ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      ></div>

      <div 
        className={`
          bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative z-10 
          transform transition-all duration-300 ease-out text-center
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        <div className="flex flex-col items-center">
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentStyle.iconBg}`}>
            {currentStyle.icon}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {message}
          </p>

          <button 
            onClick={onClose}
            className={`w-full px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 shadow-lg ${currentStyle.button}`}
          >
            {type === 'error' ? 'Coba Lagi' : 'Mengerti'}
          </button>

        </div>
      </div>
    </div>,
    document.body
  );
}