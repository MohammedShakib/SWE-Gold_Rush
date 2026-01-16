import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CRM = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null); // For View Profile
    const [messageRecipient, setMessageRecipient] = useState('All VIP Customers'); // For Messaging

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        type: 'New',
        total_spent: '',
        last_visit: new Date().toISOString().split('T')[0]
    });

    const [viewMode, setViewMode] = useState('all'); // 'all' or 'vip'

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const activeBranch = localStorage.getItem('activeBranch') || 'Main Branch';
            const userId = localStorage.getItem('userId');
            const shopownerId = localStorage.getItem('shopownerId');
            const queryParam = shopownerId ? `shopownerId=${shopownerId}` : `userId=${userId}`;
            const res = await fetch(`/api/customers?branch=${encodeURIComponent(activeBranch)}&${queryParam}`);
            const data = await res.json();
            setCustomers(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch customers", err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const activeBranch = localStorage.getItem('activeBranch') || 'Main Branch';
            const userId = localStorage.getItem('userId');
            const shopownerId = localStorage.getItem('shopownerId');
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCustomer, branch: activeBranch, userId, shopownerId })
            });
            if (res.ok) {
                setShowModal(false);
                setNewCustomer({
                    name: '',
                    phone: '',
                    type: 'New',
                    total_spent: '',
                    last_visit: new Date().toISOString().split('T')[0]
                });
                fetchCustomers();
            }
        } catch (err) {
            console.error("Error creating customer:", err);
        }
    };

    // Update Customer Type (VIP / Regular)
    const toggleVIP = async (customer) => {
        const newType = customer.type === 'VIP' ? 'Regular' : 'VIP';
        try {
            const res = await fetch(`/api/customers/${customer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: newType })
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(customers.map(c => c.id === customer.id ? updated : c));
                if (selectedCustomer && selectedCustomer.id === customer.id) {
                    setSelectedCustomer(updated);
                }
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Delete Customer
    const deleteCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setCustomers(customers.filter(c => c.id !== id));
                setSelectedCustomer(null);
            }
        } catch (err) {
            console.error("Error deleting customer:", err);
        }
    };

    const handleMessageClick = (customer) => {
        setMessageRecipient(`${customer.name} (${customer.phone})`);
        // Scroll to message section? Or just setting state is enough visual feedback.
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm));
        const matchesView = viewMode === 'all' || (viewMode === 'vip' && c.type === 'VIP');
        return matchesSearch && matchesView;
    });

    if (loading) return <div className="text-white">Loading Customers...</div>;

    const vipCount = customers.filter(c => c.type === 'VIP').length;

    return (
        <div className="space-y-8 animate-fade-in h-[calc(100vh-8rem)] flex flex-col relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">CRM & Communication</h1>
                    <p className="text-gray-400 mt-1">Customer relationships and marketing.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Important Contract / VIP Toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === 'all' ? 'vip' : 'all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all w-full sm:w-auto ${viewMode === 'vip'
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                            : 'bg-[#121418] text-gray-300 border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.557.557 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.557.557 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                        <span className="font-bold">Important Contract</span>
                        {vipCount > 0 && (
                            <span className="ml-1 bg-purple-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">{vipCount}</span>
                        )}
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary-gold text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors w-full sm:w-auto shadow-lg shadow-primary-gold/20"
                    >
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Customer List */}
                <div className="lg:col-span-2 flex flex-col bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                            {viewMode === 'vip' ? 'Important Contracts (VIP)' : 'Customer Database'}
                        </h2>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-primary-gold/50"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
                        {filteredCustomers.length === 0 ? (
                            <div className="col-span-2 text-center text-gray-500 py-10">
                                {viewMode === 'vip' ? 'No VIP contracts found.' : 'No customers found.'}
                            </div>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <div key={customer.id} className="bg-[#0B0D10] p-5 rounded-xl border border-white/5 hover:border-primary-gold/30 transition-all group cursor-pointer relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-primary-gold transition-colors">{customer.name}</h3>
                                                <p className="text-xs text-gray-500">{customer.phone}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${customer.type === 'VIP' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            customer.type === 'New' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {customer.type}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500 text-xs">Total Spent</p>
                                            <p className="text-white font-bold">৳ {customer.total_spent?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Last Visit</p>
                                            <p className="text-white">{new Date(customer.last_visit).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg text-xs transition-colors"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => handleMessageClick(customer)}
                                            className="flex-1 bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-gold py-2 rounded-lg text-xs transition-colors"
                                        >
                                            Message
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Communication Hub */}
                <div className="bg-[#121418] rounded-2xl border border-white/5 flex flex-col overflow-hidden h-full">
                    <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#121418] to-primary-gold/5">
                        <h2 className="text-xl font-bold text-white">Quick Email Blast</h2>
                        <p className="text-xs text-gray-400 mt-1">Send offers or updates to customers via Email.</p>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-6">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Channel</label>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(248,113,113,0.2)] flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    Email
                                </button>
                                {/* Disabled/Hidden Channels as per request */}
                                <button disabled className="flex-1 bg-white/5 border border-white/5 text-gray-600 py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                                    WhatsApp
                                </button>
                                <button disabled className="flex-1 bg-white/5 border border-white/5 text-gray-600 py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                                    SMS
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Recipients</label>
                            <div className="relative">
                                <select
                                    value={messageRecipient}
                                    onChange={(e) => setMessageRecipient(e.target.value)}
                                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-gold appearance-none"
                                >
                                    <option>All VIP Customers</option>
                                    <option>Customers with Due Payments</option>
                                    <option>Recent Visitors (Last 30 Days)</option>
                                    {messageRecipient.includes('(') && <option value={messageRecipient}>{messageRecipient}</option>}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Message Content</label>
                            <textarea
                                className="w-full flex-1 bg-[#0B0D10] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary-gold resize-none leading-relaxed"
                                placeholder="Subject: Exclusive Offer for You!&#10;&#10;Dear Customer,&#10;&#10;We are excited to announce..."
                            ></textarea>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-gray-600">HTML Supported</span>
                                <button className="text-xs text-primary-gold hover:underline font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Insert Template
                                </button>
                            </div>
                        </div>

                        <button className="w-full bg-primary-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40 flex items-center justify-center gap-2 transform active:scale-[0.98]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            Send Email Blast
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {/* Add Customer Modal */}
            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Customer</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-content">
                            <div>
                                <label className="modal-label">Customer Name</label>
                                <input type="text" name="name" required value={newCustomer.name} onChange={handleInputChange} className="modal-input" />
                            </div>
                            <div>
                                <label className="modal-label">Phone Number</label>
                                <input type="text" name="phone" value={newCustomer.phone} onChange={handleInputChange} className="modal-input" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="modal-label">Type</label>
                                    <select name="type" value={newCustomer.type} onChange={handleInputChange} className="modal-input">
                                        <option value="New">New</option>
                                        <option value="Regular">Regular</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="modal-label">Total Spent</label>
                                    <input type="number" name="total_spent" value={newCustomer.total_spent} onChange={handleInputChange} className="modal-input" />
                                </div>
                            </div>

                            <div>
                                <label className="modal-label">Last Visit</label>
                                <input type="date" name="last_visit" value={newCustomer.last_visit} onChange={handleInputChange} className="modal-input" />
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="modal-btn-cancel">Cancel</button>
                                <button type="submit" className="modal-btn-primary">Add Customer</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* View Profile Modal */}
            {selectedCustomer && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setSelectedCustomer(null)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Customer Profile</h2>
                            <button onClick={() => setSelectedCustomer(null)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-content pt-0">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-gold to-yellow-600 flex items-center justify-center text-black font-bold text-4xl mb-4 shadow-lg shadow-primary-gold/20">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedCustomer.name}</h3>
                                <p className="text-gray-400">{selectedCustomer.phone}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-3 ${selectedCustomer.type === 'VIP' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                    selectedCustomer.type === 'New' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}>
                                    {selectedCustomer.type} Member
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#0B0D10] p-4 rounded-xl border border-white/5 text-center">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Total Spent</p>
                                    <p className="text-white font-bold text-lg">৳ {selectedCustomer.total_spent?.toLocaleString()}</p>
                                </div>
                                <div className="bg-[#0B0D10] p-4 rounded-xl border border-white/5 text-center">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Last Visit</p>
                                    <p className="text-white font-bold text-lg">{new Date(selectedCustomer.last_visit).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => toggleVIP(selectedCustomer)}
                                    className={`w-full py-3 rounded-xl font-bold transition-colors border ${selectedCustomer.type === 'VIP'
                                        ? 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                                        }`}
                                >
                                    {selectedCustomer.type === 'VIP' ? 'Remove VIP Status' : 'Mark as VIP'}
                                </button>

                                <button
                                    onClick={() => {
                                        handleMessageClick(selectedCustomer);
                                        setSelectedCustomer(null);
                                    }}
                                    className="w-full bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/5"
                                >
                                    Send Message
                                </button>

                                <button
                                    onClick={() => deleteCustomer(selectedCustomer.id)}
                                    className="w-full text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/10 transition-colors"
                                >
                                    Delete Customer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CRM;
