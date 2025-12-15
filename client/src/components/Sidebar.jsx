import { NavLink } from "react-router-dom";
import { FiGrid, FiList, FiCreditCard, FiPieChart, FiLogOut, FiSettings, FiHexagon } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    const menus = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
        { name: 'Transaksi', path: '/transactions', icon: <FiList /> },
        { name: 'Dompet Saya', path: '/wallets', icon: <FiCreditCard /> },
        { name: 'Anggaran', path: '/budgets', icon: <FiPieChart /> },
        { name: 'Pengaturan', path: '/settings', icon: <FiSettings /> },
    ];

    return(
        <aside className="bg-white w-64 border-r border-gray-100 flex flex-col fixed left-0 top-0 h-screen z-20 shadow-xl shadow-blue-100/20 transition-all duration-300 hidden md:flex">
            <div className="flex items-center h-20 px-8 border-b border-gray-50">
                <div className="flex items-center gap-3 text-blue-600">
                    <FiHexagon className="text-3xl animate-spin-slow" />
                    <span className="text-xl font-bold tracking-tight text-blue-600">Expense</span>
                </div>
            </div>
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    Menu Utama
                </p>
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={ ({isActive}) => `
                            flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 group ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}
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
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                >
                <FiLogOut className="text-xl group-hover:-translate-x-1 transition-transform" />
                Keluar Aplikasi
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;