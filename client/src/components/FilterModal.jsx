import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';

export default function FilterModal({ 
  isOpen, 
  onClose, 
  title = "Filter", 
  onReset, 
  onApply,
  children 
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${animate ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      ></div>

      <div className={`
        bg-white w-full max-w-md relative z-10 flex flex-col max-h-[90vh]
        rounded-3xl shadow-2xl
        transform transition-all duration-300 ease-out
        ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}>
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
             {children} 
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 rounded-b-3xl flex-shrink-0">
          <button 
            onClick={onReset}
            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-white hover:border-red-200 hover:text-red-500 transition-all flex items-center gap-2"
          >
            <FiRefreshCw /> Reset
          </button>
          <button 
            onClick={() => { onApply(); onClose(); }}
            className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <FiCheck size={18} /> Terapkan
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}