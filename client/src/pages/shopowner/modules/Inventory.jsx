const Inventory = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inventory & Supply Chain</h1>
                <button className="bg-primary-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    Add New Product
                </button>
            </div>

            {/* Tabs or Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product List Placeholder */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Products</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-white uppercase">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Karat</th>
                                    <th className="p-3">Weight (g)</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="5" className="p-3 text-center py-8">No products found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Supply Tracking Placeholder */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Supply Tracking</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white">Pure Gold Stock</h3>
                            <p className="text-2xl text-primary-gold">0.00 g</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white">Supplier Profiles</h3>
                            <p className="text-sm">Manage your suppliers and incoming shipments here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
