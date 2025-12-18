import { NavLink } from "react-router-dom";
import { FiGrid, FiList, FiTag, FiCreditCard, FiPieChart, FiLogOut, FiSettings, FiHexagon, FiRepeat, FiX } from "react-icons/fi";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useContext(AuthContext);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const menus = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
        { name: 'Transaksi', path: '/transactions', icon: <FiList /> },
        { name: 'Kategori', path: '/categories', icon: <FiTag /> },
        { name: 'Dompet Saya', path: '/wallets', icon: <FiCreditCard /> },
        { name: 'Anggaran', path: '/budgets', icon: <FiPieChart /> },
        { name: 'Transfer', path: '/transfers', icon: <FiRepeat /> },
        { name: 'Pengaturan', path: '/settings', icon: <FiSettings /> },
    ];

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

    return(
        <>
            <aside 
                className={`
                    bg-white w-64 border-r border-gray-100 flex flex-col 
                    fixed left-0 top-0 h-screen z-30 shadow-xl shadow-blue-100/20 
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0
                `}
            >
                <div className="flex items-center justify-between h-20 px-8 border-b border-gray-50">
                    <div className="flex items-center gap-3 text-blue-600">
                        <FiHexagon className="text-3xl animate-spin-slow" />
                        <span className="text-xl font-bold tracking-tight text-blue-600">Expense</span>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                        Menu Utama
                    </p>
                    {menus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            onClick={onClose} 
                            className={ ({isActive}) => `
                                flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 group 
                                ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}
                            `}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                {menu.icon}
                            </span>
                            {menu.name}
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                    >
                        <FiLogOut className="text-xl group-hover:-translate-x-1 transition-transform" />
                        Keluar Aplikasi
                    </button>
                </div>
            </aside>

            <ConfirmModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Keluar Aplikasi?"
                message="Sesi Anda akan diakhiri dan Anda harus login kembali untuk mengakses data."
                type="danger"
            />
        </>
    );
};

export default Sidebar;