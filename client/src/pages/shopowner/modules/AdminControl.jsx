import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const AdminControl = () => {
    const [branches, setBranches] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTransfer, setNewTransfer] = useState({
        from_branch: 'Main Branch',
        to_branch: 'Chittagong Branch',
        items: ''
    });

    const [showBranchModal, setShowBranchModal] = useState(false);
    const [viewTransfer, setViewTransfer] = useState(null); // For View Details Modal
    const [newBranch, setNewBranch] = useState({ name: '', location: '' });

    const [editingBranch, setEditingBranch] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [branchesRes, transfersRes] = await Promise.all([
                fetch('/api/branches'),
                fetch('/api/stock-transfers')
            ]);
            const branchesData = await branchesRes.json();
            const transfersData = await transfersRes.json();

            setBranches(branchesData);
            setTransfers(transfersData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching admin data:", err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewTransfer({ ...newTransfer, [e.target.name]: e.target.value });
    };

    const handleBranchInputChange = (e) => {
        setNewBranch({ ...newBranch, [e.target.name]: e.target.value });
    };

    const handleEditBranchChange = (e) => {
        setEditingBranch({ ...editingBranch, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/stock-transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransfer)
            });
            if (res.ok) {
                setShowModal(false);
                setNewTransfer({
                    from_branch: 'Main Branch',
                    to_branch: 'Chittagong Branch',
                    items: ''
                });
                fetchData();
            }
        } catch (err) {
            console.error("Error creating transfer:", err);
        }
    };

    const handleAddBranch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/branches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBranch)
            });
            if (res.ok) {
                setShowBranchModal(false);
                setNewBranch({ name: '', location: '' });
                fetchData();
            }
        } catch (err) {
            console.error("Error creating branch:", err);
        }
    };

    const handleUpdateBranch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/branches/${editingBranch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingBranch)
            });
            if (res.ok) {
                setEditingBranch(null);
                fetchData();
            }
        } catch (err) {
            console.error("Error updating branch:", err);
        }
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this branch? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/branches/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEditingBranch(null);
                fetchData();
            }
        } catch (err) {
            console.error("Error deleting branch:", err);
        }
    };

    const handleStatusClick = async (id, currentStatus) => {
        const statuses = ['Pending', 'In Transit', 'Received'];
        const nextStatusIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const nextStatus = statuses[nextStatusIndex];

        if (!window.confirm(`Change status from '${currentStatus}' to '${nextStatus}'?`)) return;

        try {
            const res = await fetch(`/api/stock-transfers/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                setTransfers(transfers.map(t => t.id === id ? { ...t, status: nextStatus } : t));
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    if (loading) return <div className="text-white">Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Admin & Branch Control</h1>
                <button
                    onClick={() => setShowBranchModal(true)}
                    className="bg-[#121418] text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                    + Add New Branch
                </button>
            </div>

            {/* Branch Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {branches.map((branch) => (
                    <div key={branch.id} className="bg-[#121418] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{branch.name}</h2>
                                    <p className="text-gray-400 text-sm">{branch.location}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${branch.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{branch.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <p className="text-gray-500 text-xs">Daily Sales</p>
                                    <p className="text-xl font-bold text-white">৳ {branch.daily_sales?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Stock Value</p>
                                    <p className="text-xl font-bold text-primary-gold">৳ {branch.stock_value}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setEditingBranch(branch)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors"
                                >
                                    Edit Info
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">Manage Staff</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stock Transfer Section */}
            <div className="bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-white">Inter-Branch Stock Transfer</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-sm w-full md:w-auto"
                    >
                        New Transfer Request
                    </button>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-xs uppercase font-medium text-gray-300">
                                <tr>
                                    <th className="p-4">Transfer ID</th>
                                    <th className="p-4">From</th>
                                    <th className="p-4">To</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transfers.length === 0 ? (
                                    <tr><td colSpan="7" className="p-4 text-center">No transfers found.</td></tr>
                                ) : (
                                    transfers.map((transfer) => (
                                        <tr key={transfer.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs">{transfer.transfer_id}</td>
                                            <td className="p-4">{transfer.from_branch}</td>
                                            <td className="p-4">{transfer.to_branch}</td>
                                            <td className="p-4 text-white">{transfer.items}</td>
                                            <td className="p-4">{new Date(transfer.transfer_date).toLocaleString()}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleStatusClick(transfer.id, transfer.status)}
                                                    className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${transfer.status === 'Received' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        transfer.status === 'In Transit' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                    {transfer.status}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => setViewTransfer(transfer)} className="text-primary-gold hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* New Transfer Modal */}
            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Stock Transfer</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-content">
                            <div>
                                <label className="modal-label">From Branch</label>
                                <select name="from_branch" value={newTransfer.from_branch} onChange={handleInputChange} className="modal-input">
                                    {branches.map(b => <option key={b.id} value={b.name} className="bg-[#121418]">{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="modal-label">To Branch</label>
                                <select name="to_branch" value={newTransfer.to_branch} onChange={handleInputChange} className="modal-input">
                                    {branches.map(b => <option key={b.id} value={b.name} className="bg-[#121418]">{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="modal-label">Items / Description</label>
                                <textarea name="items" required value={newTransfer.items} onChange={handleInputChange} className="modal-input h-24 resize-none" placeholder="E.g., 10x Gold Necklace, 5x Diamond Ring..."></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="modal-btn-cancel">Cancel</button>
                                <button type="submit" className="modal-btn-primary">Create Transfer</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Add Branch Modal */}
            {showBranchModal && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setShowBranchModal(false)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Branch</h2>
                            <button onClick={() => setShowBranchModal(false)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddBranch} className="modal-content">
                            <div>
                                <label className="modal-label">Branch Name</label>
                                <input type="text" name="name" required value={newBranch.name} onChange={handleBranchInputChange} className="modal-input" placeholder="e.g. Sylhet Branch" />
                            </div>
                            <div>
                                <label className="modal-label">Location</label>
                                <input type="text" name="location" required value={newBranch.location} onChange={handleBranchInputChange} className="modal-input" placeholder="e.g. Zindabazar, Sylhet" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowBranchModal(false)} className="modal-btn-cancel">Cancel</button>
                                <button type="submit" className="modal-btn-primary">Add Branch</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Branch Modal */}
            {editingBranch && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setEditingBranch(null)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Branch Info</h2>
                            <button onClick={() => setEditingBranch(null)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBranch} className="modal-content">
                            <div>
                                <label className="modal-label">Branch Name</label>
                                <input type="text" name="name" required value={editingBranch.name} onChange={handleEditBranchChange} className="modal-input" />
                            </div>
                            <div>
                                <label className="modal-label">Location</label>
                                <input type="text" name="location" required value={editingBranch.location} onChange={handleEditBranchChange} className="modal-input" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="modal-label">Daily Sales (৳)</label>
                                    <input type="number" name="daily_sales" value={editingBranch.daily_sales} onChange={handleEditBranchChange} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Stock Value</label>
                                    <input type="text" name="stock_value" value={editingBranch.stock_value} onChange={handleEditBranchChange} className="modal-input" />
                                </div>
                            </div>
                            <div>
                                <label className="modal-label">Status</label>
                                <select name="status" value={editingBranch.status} onChange={handleEditBranchChange} className="modal-input">
                                    <option value="Active" className="bg-[#121418]">Active</option>
                                    <option value="Inactive" className="bg-[#121418]">Inactive</option>
                                    <option value="Maintenance" className="bg-[#121418]">Maintenance</option>
                                </select>
                            </div>
                            <div className="modal-footer justify-between">
                                <button type="button" onClick={() => handleDeleteBranch(editingBranch.id)} className="text-red-400 hover:text-red-300 text-sm font-bold px-2">Delete Branch</button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setEditingBranch(null)} className="modal-btn-cancel">Cancel</button>
                                    <button type="submit" className="modal-btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* View Transfer Details Modal */}
            {viewTransfer && createPortal(
                <div className="modal-overlay">
                    <div className="absolute inset-0" onClick={() => setViewTransfer(null)}></div>
                    <div className="modal-container max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Transfer Details</h2>
                            <button onClick={() => setViewTransfer(null)} className="modal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="modal-label">Transfer ID</label>
                                    <p className="text-white font-mono">{viewTransfer.transfer_id}</p>
                                </div>
                                <div>
                                    <label className="modal-label">Date</label>
                                    <p className="text-white">{new Date(viewTransfer.transfer_date).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="modal-label">From</label>
                                    <p className="text-white">{viewTransfer.from_branch}</p>
                                </div>
                                <div>
                                    <label className="modal-label">To</label>
                                    <p className="text-white">{viewTransfer.to_branch}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="modal-label">Status</label>
                                <span className={`px-2 py-1 rounded text-xs font-bold border inline-block ${viewTransfer.status === 'Received' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    viewTransfer.status === 'In Transit' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {viewTransfer.status}
                                </span>
                            </div>
                            <div className="bg-[#121418] p-4 rounded-xl border border-white/5 mt-4">
                                <label className="modal-label mb-2">Items</label>
                                <p className="text-gray-300 whitespace-pre-wrap">{viewTransfer.items}</p>
                            </div>
                        </div>
                        <div className="modal-footer mt-6">
                            <button onClick={() => setViewTransfer(null)} className="modal-btn-cancel w-full">Close</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminControl;
