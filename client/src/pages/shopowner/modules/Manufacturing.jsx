const Manufacturing = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manufacturing & Production</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workflow Status Board */}
                <div className="lg:col-span-2 bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Production Workflow</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-400 mb-2">New Orders</h3>
                            <div className="space-y-2">
                                {/* Card */}
                                <div className="bg-[#0B0D10] p-3 rounded border border-white/10 text-sm">
                                    <p className="text-white">Custom Ring Design</p>
                                    <p className="text-xs text-gray-500">Assigned to: Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-yellow-400 mb-2">In Progress</h3>
                            <div className="space-y-2">
                                {/* Card */}
                                <div className="bg-[#0B0D10] p-3 rounded border border-white/10 text-sm">
                                    <p className="text-white">Gold Necklace</p>
                                    <p className="text-xs text-gray-500">Stage: Molding</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-green-400 mb-2">Ready / QC</h3>
                            <div className="space-y-2">
                                {/* Card */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Tracking */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Resource Tracking</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400">Raw Gold Allocated</span>
                            <span className="text-white font-bold">0.00 g</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400">Labor Costs</span>
                            <span className="text-white font-bold">৳ 0.00</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400">Wastage</span>
                            <span className="text-white font-bold">0.00 g</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manufacturing;
