const Repairs = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Repair Management</h1>
                <button className="bg-primary-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    New Repair Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Repair List */}
                <div className="lg:col-span-3 bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Active Repairs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-white uppercase">
                                <tr>
                                    <th className="p-3">Ticket ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Issue Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Cost Est.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="6" className="text-center py-8">No active repairs</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>
                    <button className="w-full bg-white/5 text-white py-3 rounded-lg hover:bg-white/10 text-left px-4">
                        Generate Payment Link
                    </button>
                    <button className="w-full bg-white/5 text-white py-3 rounded-lg hover:bg-white/10 text-left px-4">
                        Customer E-Signature
                    </button>
                    <button className="w-full bg-white/5 text-white py-3 rounded-lg hover:bg-white/10 text-left px-4">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Repairs;
