import { useState, useEffect } from 'react';

const Repairs = () => {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Status Check Search
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const [newTicket, setNewTicket] = useState({
        customer_name: '',
        customer_phone: '',
        item_name: '',
        issue_description: '',
        estimated_cost: '',
        due_date: ''
    });

    useEffect(() => {
        fetchRepairs();
    }, []);

    const fetchRepairs = async () => {
        try {
            const res = await fetch('/api/repairs');
            const data = await res.json();
            setRepairs(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching repairs:", err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });
            if (res.ok) {
                setShowModal(false);
                setNewTicket({
                    customer_name: '',
                    customer_phone: '',
                    item_name: '',
                    issue_description: '',
                    estimated_cost: '',
                    due_date: ''
                });
                fetchRepairs();
            }
        } catch (err) {
            console.error("Error creating ticket:", err);
        }
    };

    const updateStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'In Progress'
            : currentStatus === 'In Progress' ? 'Waiting for Approval'
                : currentStatus === 'Waiting for Approval' ? 'Completed'
                    : 'Active'; // Cycle

        try {
            const res = await fetch(`/api/repairs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                fetchRepairs();
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleStatusCheck = () => {
        if (!searchId) return;
        const ticket = repairs.find(r => r.ticket_id.toLowerCase().includes(searchId.toLowerCase()));
        if (ticket) {
            setSearchResult({ found: true, ...ticket });
        } else {
            setSearchResult({ found: false });
        }
        // Clear result after 5 seconds
        setTimeout(() => setSearchResult(null), 5000);
    };

    if (loading) return <div className="text-white">Loading Repairs...</div>;

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Repair Management</h1>
                    <p className="text-gray-400 mt-1">Manage customer repairs and services.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 w-full md:w-auto"
                >
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
                        </div>
                    </div>
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#0f1115] text-xs uppercase font-medium text-gray-300">
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
                                {repairs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-gray-500">No repair tickets found. Create one to get started.</td>
                                    </tr>
                                ) : (
                                    repairs.map((repair) => (
                                        <tr key={repair.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs">{repair.ticket_id}</td>
                                            <td className="p-4 font-bold text-white">
                                                {repair.customer_name}
                                                <div className="text-xs text-gray-500 font-normal">{repair.customer_phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white">{repair.item_name}</p>
                                                <p className="text-xs text-gray-500">{repair.issue_description}</p>
                                            </td>
                                            <td className="p-4">{new Date(repair.received_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => updateStatus(repair.id, repair.status)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${repair.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            repair.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                repair.status === 'Waiting for Approval' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        }`}
                                                >
                                                    {repair.status}
                                                </button>
                                            </td>
                                            <td className="p-4 font-bold text-white">৳ {repair.estimated_cost}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-primary-gold hover:underline">Details</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/30">$</div>
                                <div>
                                    <p className="font-bold text-sm">Generate Payment Link</p>
                                    <p className="text-xs text-gray-500">Send via SMS/WhatsApp</p>
                                </div>
                            </button>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30">✎</div>
                                <div>
                                    <p className="font-bold text-sm">Digital Signature</p>
                                    <p className="text-xs text-gray-500">For item handover</p>
                                </div>
                            </button>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30">Print</div>
                                <div>
                                    <p className="font-bold text-sm">Print Receipt</p>
                                    <p className="text-xs text-gray-500">Thermal printer format</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-gold/20 to-[#121418] p-6 rounded-2xl border border-primary-gold/20 relative overflow-hidden">
                        <h3 className="font-bold text-white mb-2">Repair Status Check</h3>
                        <p className="text-xs text-gray-400 mb-4">Enter Ticket ID to check status instantly.</p>
                        <div className="flex gap-2 relative z-10">
                            <input
                                type="text"
                                placeholder="R-2023-..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-primary-gold placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleStatusCheck}
                                className="bg-primary-gold text-black rounded-lg px-3 font-bold hover:bg-yellow-400 transition-colors"
                            >
                                Go
                            </button>
                        </div>
                        {searchResult && (
                            <div className={`mt-3 p-3 rounded-lg text-sm border animate-fade-in ${searchResult.found ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {searchResult.found ? (
                                    <>
                                        <p className="font-bold">Ticket Found!</p>
                                        <p>Status: {searchResult.status}</p>
                                    </>
                                ) : (
                                    <p className="font-bold">Ticket Not Found</p>
                                )}
                            </div>
                        )}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary-gold/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* Create Ticket Modal - Fixed Position & Backdrop */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop with heavy blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowModal(false)}
                    ></div>

                    {/* Modal Content - Centered */}
                    <div className="relative bg-[#1E2024] p-8 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl animate-fade-in-up scale-100 z-10 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Create New Repair Ticket</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Customer Name</label>
                                    <input type="text" name="customer_name" required value={newTicket.customer_name} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Phone Number</label>
                                    <input type="text" name="customer_phone" value={newTicket.customer_phone} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Item Name</label>
                                <input type="text" name="item_name" required placeholder="e.g. Gold Necklace" value={newTicket.item_name} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Issue Description</label>
                                <textarea name="issue_description" required placeholder="Describe the repair needed..." value={newTicket.issue_description} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold h-20 resize-none transition-colors"></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Estimated Cost</label>
                                    <input type="number" name="estimated_cost" value={newTicket.estimated_cost} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Delivery Date</label>
                                    <input type="date" name="due_date" value={newTicket.due_date} onChange={handleInputChange} className="w-full bg-[#121418] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="bg-primary-gold text-black px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20">Create Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Repairs;
