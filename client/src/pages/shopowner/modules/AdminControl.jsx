const AdminControl = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Multi-Branch & Admin Control</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branch Overview */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Branch Overview</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">Main Branch</h3>
                                <p className="text-xs text-gray-400">Dhaka</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-400 font-bold">Active</p>
                                <p className="text-xs text-gray-400">Stock: High</p>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">Branch B</h3>
                                <p className="text-xs text-gray-400">Chittagong</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-400 font-bold">Active</p>
                                <p className="text-xs text-gray-400">Stock: Medium</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Transfer */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Stock Transfer</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">From Branch</label>
                            <select className="w-full bg-[#0B0D10] border border-white/10 rounded p-2 text-white">
                                <option>Main Branch</option>
                                <option>Branch B</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">To Branch</label>
                            <select className="w-full bg-[#0B0D10] border border-white/10 rounded p-2 text-white">
                                <option>Branch B</option>
                                <option>Main Branch</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Item ID / Barcode</label>
                            <input type="text" className="w-full bg-[#0B0D10] border border-white/10 rounded p-2 text-white" />
                        </div>
                        <button className="w-full bg-primary-gold text-black font-bold py-2 rounded hover:bg-yellow-400 transition-colors">
                            Initiate Transfer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminControl;
