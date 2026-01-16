import { useState, useEffect } from 'react';
import { SalesIcon, InventoryIcon, RepairsIcon } from '../components/Icons';

const DashboardHome = () => {
    const activeBranch = localStorage.getItem('activeBranch') || 'Main Branch';
    const [stats, setStats] = useState([
        { title: 'Total Sales (Today)', value: '৳ 0', trend: '0%', isPositive: true, icon: SalesIcon, color: 'text-green-400' },
        { title: 'Gold Rate (22K)', value: '৳ 11,250 / g', trend: '+0.8%', isPositive: true, icon: InventoryIcon, color: 'text-primary-gold' },
        { title: 'Pending Orders', value: '0', trend: '0', isPositive: true, icon: InventoryIcon, color: 'text-blue-400' },
        { title: 'Active Repairs', value: '0', trend: '0', isPositive: false, icon: RepairsIcon, color: 'text-orange-400' },
    ]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for dashboard data
                const shopownerId = localStorage.getItem('shopownerId');
                const userId = localStorage.getItem('userId');
                const queryParam = shopownerId ? `shopownerId=${shopownerId}` : `userId=${userId}`;

                const [salesRes, repairsRes, manufacturingRes] = await Promise.all([
                    fetch(`/api/sales?branch=${encodeURIComponent(activeBranch)}&${queryParam}`),
                    fetch(`/api/repairs?branch=${encodeURIComponent(activeBranch)}&${queryParam}`),
                    fetch(`/api/manufacturing?branch=${encodeURIComponent(activeBranch)}&${queryParam}`)
                ]);

                const sales = await salesRes.json();
                const repairs = await repairsRes.json();
                const manufacturing = await manufacturingRes.json();

                // Calculate Total Sales Today
                const today = new Date().toISOString().slice(0, 10);
                const todaySales = sales.filter(s => s.sale_date.startsWith(today))
                    .reduce((acc, curr) => acc + (curr.final_amount || 0), 0);

                // Calculate Counts
                const pendingOrders = manufacturing.filter(m => m.status !== 'Completed').length;
                const activeRepairsCount = repairs.filter(r => r.status === 'Active').length;

                // Update Stats
                setStats(prev => [
                    { ...prev[0], value: `৳ ${todaySales.toLocaleString()}` },
                    prev[1], // Keep Gold Rate static for now
                    { ...prev[2], value: pendingOrders.toString() },
                    { ...prev[3], value: activeRepairsCount.toString() }
                ]);

                // Update Recent Activity (Combine and Sort)
                const activities = [
                    ...sales.slice(0, 3).map(s => ({
                        id: `sale-${s.id}`, type: 'Sale', message: `Sale #${s.transaction_id}`,
                        time: new Date(s.sale_date).toLocaleTimeString(), amount: `+ ৳ ${s.final_amount}`
                    })),
                    ...repairs.slice(0, 3).map(r => ({
                        id: `repair-${r.id}`, type: 'Repair', message: `Repair: ${r.item_name}`,
                        time: new Date(r.received_date).toLocaleTimeString(), amount: `Est. ৳ ${r.estimated_cost}`
                    }))
                ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

                setRecentActivity(activities);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, [activeBranch]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-1">
                        Displaying data for <span className="text-primary-gold font-bold">{activeBranch}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Current Gold Rate (22K)</p>
                    <p className="text-2xl font-bold text-primary-gold">৳ 11,250 <span className="text-sm text-gray-500 font-normal">/ gram</span></p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-[#121418] p-6 rounded-2xl border border-white/5 hover:border-primary-gold/20 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon className="w-16 h-16 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <div className="flex items-center mt-2 gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {stat.trend}
                                    </span>
                                    <span className="text-xs text-gray-500">vs yesterday</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <button className="text-sm text-primary-gold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {recentActivity.length > 0 ? recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'Sale' ? 'bg-green-500/10 text-green-400' :
                                        activity.type === 'Repair' ? 'bg-orange-500/10 text-orange-400' :
                                            'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {activity.type === 'Sale' ? <SalesIcon className="w-5 h-5" /> :
                                            activity.type === 'Repair' ? <RepairsIcon className="w-5 h-5" /> :
                                                <InventoryIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-300">{activity.amount}</span>
                            </div>
                        )) : (
                            <p className="p-4 text-gray-500 text-center">No recent activity for this branch.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions or Mini Chart */}
                <div className="bg-gradient-to-br from-primary-gold/20 to-[#121418] rounded-2xl border border-primary-gold/20 p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-white mb-2">Gold Price Alert</h2>
                        <p className="text-sm text-gray-300 mb-6">Market is volatile today. AI predicts a slight dip by evening.</p>
                        <button className="bg-primary-gold text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 w-full">
                            Check Prediction
                        </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-gold/30 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
