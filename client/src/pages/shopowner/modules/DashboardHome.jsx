import { SalesIcon, InventoryIcon, RepairsIcon } from '../components/Icons';

const DashboardHome = () => {
    // Demo Data
    const stats = [
        {
            title: 'Total Sales (Today)',
            value: '৳ 1,24,500',
            trend: '+12.5%',
            isPositive: true,
            icon: SalesIcon,
            color: 'text-green-400'
        },
        {
            title: 'Gold Rate (22K)',
            value: '৳ 11,250 / g',
            trend: '+0.8%',
            isPositive: true,
            icon: InventoryIcon,
            color: 'text-primary-gold'
        },
        {
            title: 'Pending Orders',
            value: '8',
            trend: '-2',
            isPositive: true, // Less pending is good? Or maybe it means less business? Let's assume it's just a count.
            icon: InventoryIcon,
            color: 'text-blue-400'
        },
        {
            title: 'Active Repairs',
            value: '12',
            trend: '+3',
            isPositive: false, // More repairs might be backlog
            icon: RepairsIcon,
            color: 'text-orange-400'
        },
    ];

    const recentActivity = [
        { id: 1, type: 'Sale', message: 'Sold 22K Gold Necklace to Mrs. Rahman', time: '10 mins ago', amount: '+ ৳ 85,000' },
        { id: 2, type: 'Repair', message: 'Received Diamond Ring for polishing', time: '45 mins ago', amount: 'Est. ৳ 2,000' },
        { id: 3, type: 'Stock', message: 'Added 50g 21K Gold Chain to inventory', time: '2 hours ago', amount: 'Stock Update' },
        { id: 4, type: 'Sale', message: 'Sold Gold Earring (3g)', time: '3 hours ago', amount: '+ ৳ 32,500' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-1">Welcome back, Admin. Here's what's happening today.</p>
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
                        {recentActivity.map((activity) => (
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
                        ))}
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
