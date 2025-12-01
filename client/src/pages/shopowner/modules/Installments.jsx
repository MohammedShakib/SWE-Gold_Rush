const Installments = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Installment Tracker (Gold Savings)</h1>
                <button className="bg-primary-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    New Plan
                </button>
            </div>

            <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Active Plans</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-white uppercase">
                            <tr>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Total Amount</th>
                                <th className="p-3">Paid</th>
                                <th className="p-3">Remaining</th>
                                <th className="p-3">Next Due Date</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="6" className="text-center py-8">No active installment plans</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Installments;
