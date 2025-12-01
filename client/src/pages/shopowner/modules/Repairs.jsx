const Repairs = () => {
    const repairs = [
        { id: 'R-2023-001', customer: 'Mrs. Rahman', item: 'Gold Chain', issue: 'Broken Link', received: '2023-11-28', status: 'In Progress', cost: '৳ 1,500' },
        { id: 'R-2023-002', customer: 'Mr. Kamal', item: 'Ring Resizing', issue: 'Size 12 to 14', received: '2023-11-29', status: 'Waiting for Approval', cost: '৳ 800' },
        { id: 'R-2023-003', customer: 'Ms. Lovely', item: 'Stone Setting', issue: 'Ruby Missing', received: '2023-11-30', status: 'Completed', cost: '৳ 3,200' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Repair Management</h1>
                    <p className="text-gray-400 mt-1">Manage customer repairs and services.</p>
                </div>
                <button className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20">
                    New Repair Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Repair List */}
                <div className="lg:col-span-3 bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Active Tickets</h2>
                        <div className="flex gap-2">
                            <button className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5">All</button>
                            <button className="text-sm text-primary-gold bg-primary-gold/10 px-3 py-1 rounded-lg">Active</button>
                            <button className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5">Completed</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-xs uppercase font-medium text-gray-300">
                                <tr>
                                    <th className="p-4">Ticket ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Item & Issue</th>
                                    <th className="p-4">Received Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Est. Cost</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {repairs.map((repair) => (
                                    <tr key={repair.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-xs">{repair.id}</td>
                                        <td className="p-4 font-bold text-white">{repair.customer}</td>
                                        <td className="p-4">
                                            <p className="text-white">{repair.item}</p>
                                            <p className="text-xs text-gray-500">{repair.issue}</p>
                                        </td>
                                        <td className="p-4">{repair.received}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${repair.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    repair.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {repair.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-white">{repair.cost}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-primary-gold hover:underline">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                    <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/30">
                                    $
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Generate Payment Link</p>
                                    <p className="text-xs text-gray-500">Send via SMS/WhatsApp</p>
                                </div>
                            </button>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30">
                                    ✎
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Digital Signature</p>
                                    <p className="text-xs text-gray-500">For item handover</p>
                                </div>
                            </button>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30">
                                    Print
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Print Receipt</p>
                                    <p className="text-xs text-gray-500">Thermal printer format</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-gold/20 to-[#121418] p-6 rounded-2xl border border-primary-gold/20">
                        <h3 className="font-bold text-white mb-2">Repair Status Check</h3>
                        <p className="text-xs text-gray-400 mb-4">Enter Ticket ID to check status instantly.</p>
                        <div className="flex gap-2">
                            <input type="text" placeholder="R-2023-..." className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-primary-gold" />
                            <button className="bg-primary-gold text-black rounded-lg px-3 font-bold">Go</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Repairs;
