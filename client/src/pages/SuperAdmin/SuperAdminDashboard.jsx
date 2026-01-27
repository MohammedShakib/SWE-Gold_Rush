import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiUser, FiCalendar, FiActivity, FiLogOut, FiTrash2 } from 'react-icons/fi';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        subscription_plan: '',
        subscription_status: '',
        subscription_end_date: ''
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        fetchUsers();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showNotification('error', "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            subscription_plan: user.subscription_plan || 'free',
            subscription_status: user.subscription_status || 'active',
            subscription_end_date: user.subscription_end_date ? user.subscription_end_date.split('T')[0] : ''
        });
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                fetchUsers();
                setEditingUser(null);
                showNotification('success', "User updated successfully");
            } else {
                showNotification('error', "Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            showNotification('error', "Error updating user");
        }
    };

    const handleDeleteClick = (user) => {
        setDeleteConfirmation(user);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/users/${deleteConfirmation.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchUsers();
                setDeleteConfirmation(null);
                showNotification('success', "User deleted successfully");
            } else {
                showNotification('error', "Failed to delete user");
                setDeleteConfirmation(null);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            showNotification('error', "Error deleting user");
            setDeleteConfirmation(null);
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = () => {
        // Clear any auth tokens if needed, currently just redirect
        navigate('/signin');
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#050608] text-white flex flex-col font-outfit relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 transform transition-all animate-fade-in-down ${notification.type === 'success' ? 'bg-[#0f291e] border-green-500/30 text-green-400' : 'bg-[#2a1215] border-red-500/30 text-red-400'
                    }`}>
                    <div className={`h-2 w-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Custom SuperAdmin Header */}
            <header className="bg-[#121418] border-b border-gray-800 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-gold to-[#fcf6ba] bg-clip-text text-transparent tracking-wide">
                        GOLD RUSH
                    </h1>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-700 font-semibold uppercase tracking-wider">
                        Super Admin
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <FiLogOut /> Sign Out
                </button>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 relative z-10 w-full max-w-7xl">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-primary-gold/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Dashboard Overview
                        </h2>
                        <p className="text-gray-400">Manage all shop owners and subscriptions.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-auto">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-[#1A1C20] border border-gray-800 rounded-full pl-10 pr-6 py-3 text-sm focus:outline-none focus:border-primary-gold/50 focus:ring-1 focus:ring-primary-gold/30 transition-all w-full md:w-80 text-gray-200 placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
                    </div>
                ) : (
                    <div className="bg-[#121418] rounded-3xl border border-gray-800 shadow-xl overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#1A1C20]/50 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User Info</th>
                                        <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {user.shopowner_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 text-primary-gold font-bold text-lg shadow-inner">
                                                        {user.full_name?.[0] || <FiUser />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-200">{user.full_name}</div>
                                                        <div className="text-xs text-gray-500">{user.shop_name} • {user.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.subscription_plan === 'pro' || user.subscription_plan === 'yearly' || user.subscription_plan === 'lifetime'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : user.subscription_plan === 'monthly'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : 'bg-gray-800 text-gray-400 border-gray-700'
                                                    }`}>
                                                    {user.subscription_plan?.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${user.subscription_status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-yellow-500'}`}></span>
                                                    <span className={`text-sm ${user.subscription_status === 'active' ? 'text-green-400' : 'text-yellow-500'}`}>
                                                        {user.subscription_status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-gray-700 hover:border-gray-600 text-sm font-medium"
                                                    >
                                                        <FiEdit2 size={14} /> Update
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all border border-red-500/20 hover:border-red-500/30 text-sm font-medium"
                                                    >
                                                        <FiTrash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1C20] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-800 transform transition-all scale-100 ring-1 ring-white/10 text-center">
                        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Are you sure you want to delete <span className="text-white font-semibold">{deleteConfirmation.full_name}</span>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all border border-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Dark Overlay) */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1C20] rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-800 transform transition-all scale-100 ring-1 ring-white/10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Update Subscription</h2>
                                <p className="text-sm text-gray-400">Editing: {editingUser.full_name}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-[#121418] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-colors appearance-none"
                                        value={editForm.subscription_plan}
                                        onChange={(e) => setEditForm({ ...editForm, subscription_plan: e.target.value })}
                                    >
                                        <option value="free">Free Trial</option>
                                        <option value="monthly">Monthly Plan</option>
                                        <option value="yearly">Yearly Plan</option>
                                        <option value="lifetime">Lifetime Access</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-[#121418] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-colors appearance-none"
                                        value={editForm.subscription_status}
                                        onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">End Date</label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="date"
                                        className="w-full bg-[#121418] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-200 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-colors"
                                        value={editForm.subscription_end_date}
                                        onChange={(e) => setEditForm({ ...editForm, subscription_end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-3.5 bg-gradient-to-r from-primary-gold to-[#d4a01c] hover:shadow-lg hover:shadow-primary-gold/20 text-white rounded-xl font-bold transition-all transform hover:-translate-y-0.5"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
