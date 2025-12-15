import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

export default function CustomSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled,
  className = "",
  onClear // Fitur baru: reset filter spesifik
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Handle Clear
  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) onClear();
    setIsOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{label}</label>}
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 rounded-xl border flex justify-between items-center transition-all cursor-pointer bg-white
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'border-gray-200 hover:border-blue-300'}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-700'}
        `}
      >
        <span className={`text-sm truncate mr-2 ${!selectedOption ? 'text-gray-400' : 'font-medium'}`}>
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {selectedOption.color && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedOption.color }}></span>
              )}
              {selectedOption.label}
            </div>
          ) : (
            placeholder || 'Pilih...'
          )}
        </span>

        <div className="flex items-center gap-1">
          {/* Tombol Clear muncul jika ada value dan prop onClear */}
          {value && onClear && !disabled && (
            <div 
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors mr-1"
            >
              <FiX size={14} />
            </div>
          )}
          <FiChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu dengan Animasi */}
      <div className={`
        absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden origin-top
        transition-all duration-200 ease-in-out
        ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
      `}>
        <ul className="max-h-[240px] overflow-y-auto custom-scrollbar p-1">
          {options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ada data</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`
                  px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0
                  ${String(value) === String(opt.value) 
                    ? 'bg-blue-50 text-blue-600 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  {opt.color && (
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: opt.color }}></span>
                  )}
                  {opt.label}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}