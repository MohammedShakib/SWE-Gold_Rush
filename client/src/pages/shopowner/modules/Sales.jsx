const Sales = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Sales & Invoicing</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* POS / Calculator Section */}
                <div className="lg:col-span-2 bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">New Sale</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Product Search" className="bg-[#0B0D10] border border-white/10 rounded-lg p-3 w-full text-white" />
                            <input type="text" placeholder="Customer Name" className="bg-[#0B0D10] border border-white/10 rounded-lg p-3 w-full text-white" />
                        </div>

                        {/* Calculation Preview */}
                        <div className="bg-white/5 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Gold Price * Weight</span>
                                <span>0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Making Charge</span>
                                <span>0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Stone Cost</span>
                                <span>0.00</span>
                            </div>
                            <div className="flex justify-between text-red-400">
                                <span>Discount</span>
                                <span>-0.00</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Tax</span>
                                <span>0.00</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg text-primary-gold">
                                <span>Total</span>
                                <span>0.00</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-white/10 text-white py-3 rounded-lg hover:bg-white/20">Generate Invoice</button>
                            <button className="bg-primary-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-400">Process Payment</button>
                        </div>
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
                    <div className="space-y-3">
                        {/* Placeholder Items */}
                        <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">INV-001</p>
                                <p className="text-xs text-gray-400">Walk-in Customer</p>
                            </div>
                            <span className="text-green-400 text-sm">Paid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
