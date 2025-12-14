import { CgSpinner } from 'react-icons/cg'; 

const Button = ({ children, onClick, type = "button", isLoading = false, fullWidth = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-white
        bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600
        active:scale-95 transform transition-all duration-200 shadow-md hover:shadow-lg
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <><CgSpinner className="animate-spin text-xl mr-2" /> Loading...</>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;