import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger' // 'danger' | 'success' | 'info'
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Logic Animasi Masuk & Keluar
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Jeda 10ms agar browser merender state awal (hidden) dulu, baru transisi ke visible
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      // Tunggu durasi animasi (300ms) selesai, baru hapus dari DOM
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  // Konfigurasi Style Berdasarkan Tipe
  const styleConfig = {
    danger: {
      icon: <FiAlertTriangle size={32} />,
      iconBg: 'bg-red-50 text-red-500',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200'
    },
    success: {
      icon: <FiCheckCircle size={32} />,
      iconBg: 'bg-emerald-50 text-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
    },
    info: {
      icon: <FiInfo size={32} />,
      iconBg: 'bg-blue-50 text-blue-500',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
    }
  };

  const currentStyle = styleConfig[type] || styleConfig.info;

  // Render ke Body (Portal)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* 1. BACKDROP (Fade In/Out) */}
      <div 
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out
          ${animate ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      ></div>

      {/* 2. MODAL CARD (Scale & Fade In/Out) */}
      <div 
        className={`
          bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative z-10 
          transform transition-all duration-300 ease-out
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        <div className="flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentStyle.iconBg}`}>
            {currentStyle.icon}
          </div>
          
          {/* Content */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center ${currentStyle.btn}`}
            >
              Ya, Lanjutkan
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}