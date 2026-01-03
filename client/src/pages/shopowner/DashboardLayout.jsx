import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const DashboardLayout = () => {
    const isAuthenticated = localStorage.getItem('shopowner_auth') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return (
        <div className="min-h-screen bg-[#050608] text-white flex">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
