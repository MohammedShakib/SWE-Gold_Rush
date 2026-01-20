import React, { useState } from 'react';
import { Package, Heart, Camera, LogOut, User, MapPin, ChevronRight, Star } from 'lucide-react';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('orders');

    const tabs = [
        { id: 'orders', label: 'Order History', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'reviews', label: 'My Reviews', icon: Camera },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">My Jewellery Box</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* User Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gold-100 to-gold-200 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center p-1 shadow-md">
                                <div className="w-full h-full bg-gold-50 rounded-full flex items-center justify-center text-gold-600">
                                    <User size={40} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">John Doe</h3>
                            <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-1">
                                <MapPin size={14} /> Dhaka, Bangladesh
                            </p>
                            <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider rounded-full">
                                Gold Member
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${isActive
                                            ? 'bg-gold-500 text-white shadow-gold-sm shadow-md'
                                            : 'text-gray-600 hover:bg-gold-50 hover:text-gold-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gold-500'} />
                                        {tab.label}
                                    </span>
                                    {isActive && <ChevronRight size={16} />}
                                </button>
                            );
                        })}
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors">
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex items-end justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Recent Orders</h2>
                            </div>

                            <div className="space-y-6">
                                {[1, 2].map(order => (
                                    <div key={order} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                        <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-gray-100">
                                            <div className="flex gap-6 text-sm">
                                                <div>
                                                    <p className="text-gray-500 mb-1">Order Placed</p>
                                                    <p className="font-semibold text-gray-900">15 Jan 2026</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Order ID</p>
                                                    <p className="font-semibold text-gray-900">#GR-2026-00{order}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Total Amount</p>
                                                    <p className="font-semibold text-gray-900">৳ 55,000</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Delivered
                                                </span>
                                                <button className="text-gold-600 hover:text-gold-700 text-sm font-semibold border border-gold-200 px-3 py-1.5 rounded-lg hover:bg-gold-50 transition-colors">
                                                    Invoice
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=200&auto=format&fit=crop')" }}></div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-lg text-gray-900 mb-1">22K Gold Ring with Diamond</h4>
                                                    <p className="text-sm text-gray-500 mb-2">Amin Jewellers • Size: 12 • Weight: 5g</p>
                                                    <div className="flex items-center gap-2 text-sm text-gold-600 font-medium cursor-pointer hover:underline">
                                                        Buy Again
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <button className="bg-gold-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gold-600 transition-colors shadow-gold-sm hover:shadow-gold-md">
                                                        Write a Review
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">My Wishlist</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map(item => (
                                    <div key={item} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                            <img
                                                src={`https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop`}
                                                alt="Jewelry"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <button className="absolute top-3 right-3 bg-white p-2 rounded-full text-red-500 shadow-md hover:bg-red-50 transition-colors">
                                                <Heart size={18} fill="currentColor" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs text-gold-600 font-bold uppercase tracking-wider mb-1">Necklace</p>
                                                    <h4 className="font-bold text-gray-900 truncate pr-2">Silver Chain with Pendant</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="font-bold text-xl text-gray-900">৳ 4,500</span>
                                                <button className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gold-500 transition-colors">
                                                    <Package size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">My Reviews</h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <Camera size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Share your experience with your purchased items to help other customers make better choices.</p>
                                <button onClick={() => setActiveTab('orders')} className="bg-gold-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gold-600 transition-colors">
                                    Go to Orders
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
