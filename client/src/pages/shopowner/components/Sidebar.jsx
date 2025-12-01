import { Link, useLocation } from 'react-router-dom';
import {
    DashboardIcon, InventoryIcon, SalesIcon, InstallmentIcon,
    ManufacturingIcon, RepairsIcon, CRMIcon, AdminIcon, AIIcon, LogoutIcon
} from './Icons';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/shopowner/dashboard', icon: DashboardIcon },
        { name: 'Inventory', path: '/shopowner/inventory', icon: InventoryIcon },
        { name: 'Sales & Invoicing', path: '/shopowner/sales', icon: SalesIcon },
        { name: 'Installment Tracker', path: '/shopowner/installments', icon: InstallmentIcon },
        { name: 'Manufacturing', path: '/shopowner/manufacturing', icon: ManufacturingIcon },
        { name: 'Repairs', path: '/shopowner/repairs', icon: RepairsIcon },
        { name: 'CRM', path: '/shopowner/crm', icon: CRMIcon },
        { name: 'Admin Control', path: '/shopowner/admin', icon: AdminIcon },
        { name: 'AI Price Prediction', path: '/shopowner/ai-prediction', icon: AIIcon },
    ];

    return (
        <div className="w-64 bg-[#121418] border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-primary-gold tracking-wider">GOLD RUSH</h1>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Shop Owner Panel</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                    ? 'bg-gradient-to-r from-primary-gold/20 to-transparent text-primary-gold border-l-2 border-primary-gold'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-gold' : 'text-gray-500 group-hover:text-white'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('shopowner_auth');
                        window.location.href = '/shopowner/login';
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left group"
                >
                    <LogoutIcon className="w-5 h-5 group-hover:text-red-500" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
