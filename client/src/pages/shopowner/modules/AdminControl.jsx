const AdminControl = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">Admin & Branch Control</h1>

            {/* Branch Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#121418] to-primary-gold/5 p-6 rounded-2xl border border-primary-gold/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Main Branch</h2>
                                <p className="text-gray-400 text-sm">Dhaka, Bangladesh</p>
                            </div>
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <p className="text-gray-500 text-xs">Daily Sales</p>
                                <p className="text-xl font-bold text-white">৳ 1,25,000</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Stock Value</p>
                                <p className="text-xl font-bold text-primary-gold">৳ 3.2 Cr</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">View Report</button>
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">Manage Staff</button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Chittagong Branch</h2>
                                <p className="text-gray-400 text-sm">Agrabad, Chittagong</p>
                            </div>
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <p className="text-gray-500 text-xs">Daily Sales</p>
                                <p className="text-xl font-bold text-white">৳ 85,000</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Stock Value</p>
                                <p className="text-xl font-bold text-primary-gold">৳ 1.5 Cr</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">View Report</button>
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">Manage Staff</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Transfer Section */}
            <div className="bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Inter-Branch Stock Transfer</h2>
                    <button className="bg-primary-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-sm">
                        New Transfer Request
                    </button>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-xs uppercase font-medium text-gray-300">
                                <tr>
                                    <th className="p-4">Transfer ID</th>
                                    <th className="p-4">From</th>
                                    <th className="p-4">To</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-xs">TR-8821</td>
                                    <td className="p-4">Main Branch</td>
                                    <td className="p-4">Chittagong Branch</td>
                                    <td className="p-4 text-white">250g Gold Bars</td>
                                    <td className="p-4">Today, 10:30 AM</td>
                                    <td className="p-4"><span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-xs font-bold">In Transit</span></td>
                                    <td className="p-4 text-right"><button className="text-primary-gold hover:underline">Track</button></td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-xs">TR-8815</td>
                                    <td className="p-4">Chittagong Branch</td>
                                    <td className="p-4">Main Branch</td>
                                    <td className="p-4 text-white">Defective Returns (5)</td>
                                    <td className="p-4">Yesterday</td>
                                    <td className="p-4"><span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-xs font-bold">Received</span></td>
                                    <td className="p-4 text-right"><button className="text-primary-gold hover:underline">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminControl;
