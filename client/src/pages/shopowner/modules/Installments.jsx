import { useState } from 'react';

const Installments = () => {
    const [plans] = useState([
        { id: 'GP-5001', customer: 'Mrs. Fatema Begum', item: '22K Gold Necklace', total: 125000, paid: 75000, remaining: 50000, nextDue: '2025-12-10', status: 'Active', progress: 60 },
        { id: 'GP-5002', customer: 'Mr. Rahim Uddin', item: 'Diamond Ring', total: 85000, paid: 85000, remaining: 0, nextDue: '-', status: 'Completed', progress: 100 },
        { id: 'GP-5003', customer: 'Ms. Sadia Islam', item: 'Gold Bangle Set', total: 160000, paid: 40000, remaining: 120000, nextDue: '2025-12-05', status: 'Overdue', progress: 25 },
        { id: 'GP-5004', customer: 'Dr. Hasan Mahmud', item: 'Platinum Band', total: 60000, paid: 30000, remaining: 30000, nextDue: '2025-12-15', status: 'Active', progress: 50 },
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Installment Tracker</h1>
                    <p className="text-gray-400 mt-1">Track gold booking and savings plans.</p>
                </div>
                <button className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20">
                    Create New Plan
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Total Active Value</p>
                    <p className="text-2xl font-bold text-white mt-1">৳ 4,30,000</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Collected This Month</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">৳ 1,25,000</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Overdue Payments</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">2 Accounts</p>
                </div>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-[#121418] p-6 rounded-2xl border border-white/5 hover:border-primary-gold/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{plan.customer}</h3>
                                <p className="text-sm text-primary-gold">{plan.item}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${plan.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    plan.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {plan.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="text-white font-bold">{plan.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${plan.status === 'Completed' ? 'bg-green-400' :
                                                plan.status === 'Overdue' ? 'bg-red-400' : 'bg-primary-gold'
                                            }`}
                                        style={{ width: `${plan.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Total Amount</p>
                                    <p className="text-white font-bold">৳ {plan.total.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Remaining</p>
                                    <p className="text-white font-bold">৳ {plan.remaining.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <p className="text-xs text-gray-500">Next Due: <span className="text-white">{plan.nextDue}</span></p>
                                <button className="text-sm text-primary-gold hover:underline">View History</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Installments;
