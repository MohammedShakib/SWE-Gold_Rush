import React, { useState } from 'react';
import { Trash2, Store, Minus, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    // Dummy Cart Data Grouped by Shop
    const [cartItems] = useState([
        {
            shopName: 'Amin Jewellers',
            items: [
                { id: 1, name: '22K Gold Wedding Ring', price: 55000, quantity: 1, image: 'https://images.unsplash.com/photo-1605100804763-ebea24d54625?q=80&w=800&auto=format&fit=crop' }
            ]
        },
        {
            shopName: 'Diamond World',
            items: [
                { id: 2, name: '18K Diamond Necklace', price: 150000, quantity: 1, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' }
            ]
        }
    ]);

    const total = cartItems.reduce((acc, shop) =>
        acc + shop.items.reduce((sAcc, item) => sAcc + (item.price * item.quantity), 0)
        , 0);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 md:mb-12">Shopping Cart ({cartItems.reduce((acc, shop) => acc + shop.items.length, 0)} Items)</h1>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                {/* Cart Items List */}
                <div className="flex-1 space-y-8">
                    {cartItems.map((shop, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Shop Header */}
                            <div className="bg-gold-50 px-6 py-4 border-b border-gold-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full shadow-sm text-gold-600">
                                    <Store size={20} />
                                </div>
                                <span className="font-bold text-gray-900 text-lg">{shop.shopName}</span>
                            </div>

                            {/* Items */}
                            <div className="p-6 space-y-8">
                                {shop.items.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-6">
                                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-xl text-gray-900 font-serif leading-tight">{item.name}</h3>
                                                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4">Availability: <span className="text-green-600 font-medium">In Stock</span></p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                                    <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-gold-600 hover:scale-105 transition-all">
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-base font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                                                    <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-gold-600 hover:scale-105 transition-all">
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-2xl font-bold text-gold-600">
                                                    ৳ {item.price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[400px] xl:w-[450px]">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Order Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">৳ {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Fee</span>
                                <span className="font-medium text-gray-900">৳ 120</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT (Included)</span>
                                <span className="font-medium text-gray-900">৳ 0</span>
                            </div>
                            <div className="my-4 border-t border-dashed border-gray-200"></div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-3xl text-gold-600">৳ {(total + 120).toLocaleString()}</span>
                            </div>
                        </div>

                        <Link
                            to="/checkout"
                            className="w-full group bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-gold-200 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
                        >
                            Proceed to Checkout
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                            <ShieldCheck size={16} />
                            <span>Secure Checkout Guaranteed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
