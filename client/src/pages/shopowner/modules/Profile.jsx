import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Store, Building2, Phone, Mail, X, Shield, Lock, CheckCircle, CreditCard, Calendar } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', phone: '', identifier: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('/api/user-profile');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setEditForm(data);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setUser(editForm);
                setIsEditing(false);
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords don't match");
            return;
        }

        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setMessage('Password changed successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setPasswordError(data.error || 'Failed to change password');
            }
        } catch (err) {
            console.error("Error changing password:", err);
            setPasswordError('Something went wrong');
        }
    };

    if (loading) return <div className="text-white">Loading Profile...</div>;
    if (!user) return <div className="text-white">User not found. Please log in first.</div>;

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your account details and security</p>
                {message && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl flex items-center gap-2 max-w-md animate-fade-in">
                        <CheckCircle size={18} /> {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[#121418] border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-gold/20 to-primary-gold/5 border-2 border-primary-gold/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                    <User size={50} className="text-primary-gold" />
                                </div>
                                <span className="px-3 py-1 bg-primary-gold/10 text-primary-gold text-xs font-bold rounded-full border border-primary-gold/20">
                                    Shop Owner
                                </span>
                            </div>

                            <div className="flex-1 w-full space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-1">{user.full_name}</h2>
                                        <p className="text-gray-400 text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition-colors border border-white/10"
                                    >
                                        Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Mail size={18} className="text-primary-gold/70" />
                                            <span className="text-xs text-gray-500 uppercase font-bold">Email / Identifier</span>
                                        </div>
                                        <p className="text-white font-medium pl-8">{user.identifier}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Phone size={18} className="text-primary-gold/70" />
                                            <span className="text-xs text-gray-500 uppercase font-bold">Phone Number</span>
                                        </div>
                                        <p className="text-white font-medium pl-8">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Subscription & Security */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Subscription Card */}
                    <div className="bg-[#121418] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-gold/20 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <CreditCard className="text-white/10 w-24 h-24 -mr-8 -mt-8 transform rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-white/10">
                                    <Store className="text-purple-400" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">My Plan</h3>
                            </div>

                            <div className="mb-6">
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Premium Plan</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">Active</span>
                                    <span className="text-xs text-gray-500">Auto-renews</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> Next Billing</span>
                                    <span className="text-white">Jan 30, 2026</span>
                                </div>
                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg border border-white/5 transition-colors">
                                    Manage Subscription
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[#121418] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Shield className="text-red-400" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Security</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">Manage your password and account security settings.</p>
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium"
                        >
                            <Lock size={16} /> Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
                    <div className="relative bg-[#1E2024] p-8 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl animate-fade-in-up m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Email / Identifier</label>
                                <input
                                    type="text"
                                    value={editForm.identifier}
                                    onChange={e => setEditForm({ ...editForm, identifier: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5">Cancel</button>
                                <button type="submit" className="bg-primary-gold text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsChangingPassword(false)}></div>
                    <div className="relative bg-[#1E2024] p-8 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl animate-fade-in-up m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Change Password</h2>
                            <button onClick={() => setIsChangingPassword(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full bg-[#121418] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-gold"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5">Cancel</button>
                                <button type="submit" className="bg-primary-gold text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
