const DashboardHome = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-2">Total Sales (Today)</h3>
                    <p className="text-2xl font-bold text-white">৳ 0.00</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-2">Gold Rate (22K)</h3>
                    <p className="text-2xl font-bold text-primary-gold">৳ 0.00</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-2">Pending Orders</h3>
                    <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-2">Active Repairs</h3>
                    <p className="text-2xl font-bold text-white">0</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
