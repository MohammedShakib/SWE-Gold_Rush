import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/shopowner/dashboard' },
        { name: 'Inventory', path: '/shopowner/inventory' },
        { name: 'Sales & Invoicing', path: '/shopowner/sales' },
        { name: 'Installment Tracker', path: '/shopowner/installments' },
        { name: 'Manufacturing', path: '/shopowner/manufacturing' },
        { name: 'Repairs', path: '/shopowner/repairs' },
        { name: 'CRM', path: '/shopowner/crm' },
        { name: 'Admin Control', path: '/shopowner/admin' },
        { name: 'AI Price Prediction', path: '/shopowner/ai-prediction' },
    ];

    return (
        <div className="w-64 bg-[#121418] border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-primary-gold">Gold Rush</h1>
                <p className="text-xs text-gray-400">Shop Owner Panel</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                                ? 'bg-primary-gold/10 text-primary-gold border border-primary-gold/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('shopowner_auth');
                        window.location.href = '/shopowner/login';
                    }}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
