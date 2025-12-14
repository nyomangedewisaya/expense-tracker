const Input = ({ label, type = "text", placeholder, value, onChange, error }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type}
        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all duration-200
          ${error 
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'
          }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
export default Input;