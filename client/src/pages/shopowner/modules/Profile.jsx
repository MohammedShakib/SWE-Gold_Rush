import React, { useState } from 'react';
import { User, MapPin, Plus, Store, Building2, Phone, Mail, X } from 'lucide-react';

const Profile = () => {
    // Placeholder Data
    const [user] = useState({
        name: "Shop Owner",
        role: "Owner",
        email: "owner@goldrush.com",
        phone: "+880 1711 223344",
        joined: "January 2024"
    });

    const [branches, setBranches] = useState([
        { id: 1, name: "Gulshan Branch", address: "Plot 1, Road 1, Gulshan 1, Dhaka", phone: "01700000001", manager: "Rahim Ahmed" },
        { id: 2, name: "Dhanmondi Branch", address: "House 2, Road 2, Dhanmondi, Dhaka", phone: "01700000002", manager: "Karim Uddin" }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '', manager: '' });

    const handleAddBranch = (e) => {
        e.preventDefault();
        const branch = { id: Date.now(), ...newBranch };
        setBranches([...branches, branch]);
        setShowAddModal(false);
        setNewBranch({ name: '', address: '', phone: '', manager: '' });
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Settings</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your account and branch details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#121418] border border-white/5 rounded-2xl p-6 relative overflow-hiddenGroup">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-gold/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-gold/20 to-primary-gold/5 border-2 border-primary-gold/30 flex items-center justify-center mb-4">
                                <User size={40} className="text-primary-gold" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <span className="px-3 py-1 bg-primary-gold/10 text-primary-gold text-xs font-bold rounded-full mt-2 border border-primary-gold/20">
                                {user.role}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-gray-400 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <Mail size={18} className="text-primary-gold/70" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="text-sm text-white/90">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <Phone size={18} className="text-primary-gold/70" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="text-sm text-white/90">{user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <User size={18} className="text-primary-gold/70" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Member Since</p>
                                    <p className="text-sm text-white/90">{user.joined}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branch Management Section */}
                <div className="lg:col-span-2">
                    <div className="bg-[#121418] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-gold/10 rounded-lg">
                                    <Store className="text-primary-gold" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Branch Management</h2>
                                    <p className="text-gray-400 text-sm">Manage your store locations</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-primary-gold text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-primary-gold/20"
                            >
                                <Plus size={18} />
                                Add Branch
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {branches.map(branch => (
                                <div key={branch.id} className="group bg-black/20 border border-white/5 hover:border-primary-gold/30 rounded-xl p-4 transition-all duration-300 hover:bg-white/5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary-gold/10 transition-colors">
                                            <Building2 size={20} className="text-gray-400 group-hover:text-primary-gold transition-colors" />
                                        </div>
                                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Active</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">{branch.name}</h3>
                                    <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                                        <MapPin size={14} /> {branch.address}
                                    </p>

                                    <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Manager</span>
                                            <span className="text-gray-300">{branch.manager}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-gray-500">Contact</span>
                                            <span className="text-gray-300">{branch.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Branch Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Add New Branch</h2>

                        <form onSubmit={handleAddBranch} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                    placeholder="e.g. Gulshan Branch"
                                    value={newBranch.name}
                                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                    placeholder="Full Address"
                                    value={newBranch.address}
                                    onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Manager Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                        placeholder="John Doe"
                                        value={newBranch.manager}
                                        onChange={e => setNewBranch({ ...newBranch, manager: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50"
                                        placeholder="+880..."
                                        value={newBranch.phone}
                                        onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-primary-gold text-black hover:bg-yellow-500 transition-colors font-bold shadow-lg shadow-primary-gold/20"
                                >
                                    Create Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
