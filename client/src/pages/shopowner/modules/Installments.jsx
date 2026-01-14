import { useState, useEffect } from 'react';
import { Plus, X, Calendar, User, Search, Check } from 'lucide-react';
import CustomAlert from '../../../components/CustomAlert';

const Installments = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        customer_id: '',
        item_description: '',
        total_amount: '',
        paid_amount: '',
        due_date: ''
    });

    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        fetchInstallments();
        fetchCustomers();
    }, []);

    const fetchInstallments = () => {
        setLoading(true);
        fetch('/api/installments')
            .then(res => res.json())
            .then(data => {
                setPlans(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                showAlert('Error', 'Failed to fetch installments', 'danger');
                setLoading(false);
            });
    };

    const fetchCustomers = () => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error(err));
    };

    const handleCreate = () => {
        if (!formData.customer_id || !formData.item_description || !formData.total_amount) {
            showAlert('Validation Error', 'Please fill all required fields', 'danger');
            return;
        }

        fetch('/api/installments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => {
                if (res.ok) {
                    showAlert('Success', 'Installment plan created successfully', 'success');
                    setIsModalOpen(false);
                    fetchInstallments();
                    setFormData({
                        customer_id: '',
                        item_description: '',
                        total_amount: '',
                        paid_amount: '',
                        due_date: ''
                    });
                } else {
                    showAlert('Error', 'Failed to create plan', 'danger');
                }
            })
            .catch(err => console.error(err));
    };

    const calculateProgress = (total, paid) => {
        if (!total) return 0;
        return Math.min(Math.round((paid / total) * 100), 100);
    };

    // Calculate Stats
    const totalActiveValue = plans.filter(p => p.status === 'Active').reduce((acc, curr) => acc + (curr.total_amount - curr.paid_amount), 0);
    const overdueCount = plans.filter(p => p.status === 'Overdue').length;

    // History Logic
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [payments, setPayments] = useState([]);
    const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', notes: '' });

    const handleViewHistory = (plan) => {
        setSelectedPlan(plan);
        setHistoryModalOpen(true);
        fetchPayments(plan.id);
    };

    const fetchPayments = (id) => {
        fetch(`/api/installments/${id}/payments`)
            .then(res => res.json())
            .then(data => setPayments(data))
            .catch(err => console.error(err));
    };

    const handleAddPayment = () => {
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
            showAlert('Error', 'Please enter a valid amount', 'danger');
            return;
        }

        fetch(`/api/installments/${selectedPlan.id}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentForm)
        })
            .then(res => {
                if (res.ok) {
                    showAlert('Success', 'Payment recorded successfully', 'success');
                    fetchPayments(selectedPlan.id);
                    fetchInstallments();
                    setPaymentForm({ amount: '', method: 'Cash', notes: '' });

                    setSelectedPlan(prev => ({
                        ...prev,
                        paid_amount: prev.paid_amount + parseFloat(paymentForm.amount)
                    }));
                } else {
                    showAlert('Error', 'Failed to record payment', 'danger');
                }
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <CustomAlert
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Installment Tracker</h1>
                    <p className="text-gray-400 mt-1">Track gold booking and savings plans.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 w-full md:w-auto flex items-center gap-2 justify-center"
                >
                    <Plus size={20} />
                    Create New Plan
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Total Due Value</p>
                    <p className="text-2xl font-bold text-white mt-1">৳ {totalActiveValue.toLocaleString()}</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Active Plans</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{plans.filter(p => p.status === 'Active').length}</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Overdue Payments</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{overdueCount} Accounts</p>
                </div>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading plans...</div>
                ) : plans.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">No installment plans found.</div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan.id} className="bg-[#121418] p-6 rounded-2xl border border-white/5 hover:border-primary-gold/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{plan.customer_name || 'Unknown Customer'}</h3>
                                    <p className="text-sm text-primary-gold">{plan.item_description}</p>
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
                                        <span className="text-white font-bold">{calculateProgress(plan.total_amount, plan.paid_amount)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${plan.status === 'Completed' ? 'bg-green-400' :
                                                plan.status === 'Overdue' ? 'bg-red-400' : 'bg-primary-gold'
                                                }`}
                                            style={{ width: `${calculateProgress(plan.total_amount, plan.paid_amount)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-gray-500 text-xs">Total Amount</p>
                                        <p className="text-white font-bold">৳ {plan.total_amount.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-gray-500 text-xs">Remaining</p>
                                        <p className="text-white font-bold">৳ {(plan.total_amount - plan.paid_amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <p className="text-xs text-gray-500">Next Due: <span className="text-white">{plan.due_date ? new Date(plan.due_date).toLocaleDateString() : 'N/A'}</span></p>
                                    <button
                                        onClick={() => handleViewHistory(plan)}
                                        className="text-sm text-primary-gold hover:underline"
                                    >
                                        View History
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Create Installment Plan</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Customer</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                >
                                    <option value="" className="bg-[#121418]">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id} className="bg-[#121418]">{c.name} ({c.phone})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Item Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 22K Gold Chain Booking"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                    value={formData.item_description}
                                    onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Total Amount (৳)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Advance/Paid (৳)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Next Due Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full bg-primary-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary-gold/20 mt-4"
                            >
                                Create Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History & Payment Modal */}
            {historyModalOpen && selectedPlan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Payment History</h2>
                                <p className="text-sm text-primary-gold mt-1">{selectedPlan.item_description} - {selectedPlan.customer_name}</p>
                            </div>
                            <button
                                onClick={() => setHistoryModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase">Total</p>
                                    <p className="text-white font-bold">৳ {selectedPlan.total_amount.toLocaleString()}</p>
                                </div>
                                <div className="bg-green-500/10 p-4 rounded-xl text-center border border-green-500/20">
                                    <p className="text-xs text-green-400 uppercase">Paid</p>
                                    <p className="text-green-400 font-bold">৳ {selectedPlan.paid_amount.toLocaleString()}</p>
                                </div>
                                <div className="bg-red-500/10 p-4 rounded-xl text-center border border-red-500/20">
                                    <p className="text-xs text-red-400 uppercase">Remaining</p>
                                    <p className="text-red-400 font-bold">৳ {(selectedPlan.total_amount - selectedPlan.paid_amount).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Add Payment Form */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Check size={16} className="text-primary-gold" />
                                    Record New Payment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Amount</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-gold"
                                            placeholder="0.00"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Method</label>
                                        <select
                                            className="w-full bg-[#121418] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-gold"
                                            value={paymentForm.method}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                        >
                                            <option>Cash</option>
                                            <option>Card</option>
                                            <option>Bank Transfer</option>
                                            <option>bKash</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAddPayment}
                                        className="bg-primary-gold text-black font-bold py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                                    >
                                        Add Payment
                                    </button>
                                </div>
                            </div>

                            {/* History Table */}
                            <div>
                                <h3 className="text-white font-bold mb-3 text-sm">Transaction Ledger</h3>
                                <div className="overflow-hidden rounded-xl border border-white/10">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                            <tr>
                                                <th className="py-3 px-4 font-medium">Date</th>
                                                <th className="py-3 px-4 font-medium">Method</th>
                                                <th className="py-3 px-4 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="py-4 text-center text-gray-500 text-xs">No payments recorded yet.</td>
                                                </tr>
                                            ) : (
                                                payments.map((pay, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 text-gray-300">{new Date(pay.payment_date).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-gray-300">{pay.payment_method}</td>
                                                        <td className="py-3 px-4 text-right text-green-400 font-bold">+ ৳ {pay.amount.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Installments;


