import React, { useState } from 'react';
import { Package, MapPin, Truck, Store, CreditCard } from 'lucide-react';

const Checkout = () => {
    const [deliveryMethod, setDeliveryMethod] = useState({}); // { 0: 'delivery', 1: 'pickup' }

    const toggleDelivery = (shopIndex, method) => {
        setDeliveryMethod(prev => ({ ...prev, [shopIndex]: method }));
    };

    const shops = [
        { name: 'Amin Jewellers', items: ['22K Gold Wedding Ring'] },
        { name: 'Diamond World', items: ['18K Diamond Necklace'] }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-gold-500" /> Delivery Address
                        </h2>
                        <div className="flex items-start gap-4 p-4 border border-gold-200 bg-gold-50 rounded-lg">
                            <input type="radio" checked className="mt-1 text-gold-500 focus:ring-gold-500" />
                            <div>
                                <span className="font-bold block text-gray-800">Home</span>
                                <p className="text-sm text-gray-600">House 12, Road 5, Block C, Banani, Dhaka</p>
                                <p className="text-sm text-gray-600">+880 1712 345678</p>
                            </div>
                            <button className="text-gold-600 text-xs font-bold ml-auto uppercase">Edit</button>
                        </div>
                    </section>

                    {/* Packages (Split Shipment View) */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-gold-500" /> Shipment Details
                        </h2>

                        {shops.map((shop, idx) => (
                            <div key={idx} className="mb-6 last:mb-0 border border-gray-100 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-sm font-medium text-gray-600 flex justify-between">
                                    <span>Package {idx + 1} of {shops.length}</span>
                                    <span className="flex items-center gap-1"><Store size={14} /> Sold by {shop.name}</span>
                                </div>

                                <div className="p-4">
                                    {shop.items.map((item, i) => (
                                        <div key={i} className="mb-4 text-gray-800 font-medium">{item}</div>
                                    ))}

                                    {/* Delivery vs Pickup Toggle */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-sm text-gray-500 block mb-2">Choose Delivery Option:</span>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!deliveryMethod[idx] || deliveryMethod[idx] === 'delivery' ? 'border-gold-500 bg-gold-50' : 'border-gray-200'}`}>
                                                <input
                                                    type="radio"
                                                    name={`delivery-${idx}`}
                                                    onChange={() => toggleDelivery(idx, 'delivery')}
                                                    checked={!deliveryMethod[idx] || deliveryMethod[idx] === 'delivery'}
                                                    className="text-gold-500 focus:ring-gold-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 font-bold text-sm"><Truck size={16} /> Home Delivery</div>
                                                    <div className="text-xs text-gray-500">Est. 20 Jan</div>
                                                </div>
                                                <div className="font-bold text-sm">৳ 60</div>
                                            </label>

                                            <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod[idx] === 'pickup' ? 'border-gold-500 bg-gold-50' : 'border-gray-200'}`}>
                                                <input
                                                    type="radio"
                                                    name={`delivery-${idx}`}
                                                    onChange={() => toggleDelivery(idx, 'pickup')}
                                                    checked={deliveryMethod[idx] === 'pickup'}
                                                    className="text-gold-500 focus:ring-gold-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 font-bold text-sm"><Store size={16} /> Store Pickup</div>
                                                    <div className="text-xs text-gray-500">Ready in 24h</div>
                                                </div>
                                                <div className="font-bold text-sm text-green-600">FREE</div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Payment Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>৳ 205,000</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Total</span>
                                <span>৳ 120</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-100 font-bold text-lg text-gray-900">
                                <span>Total Amount</span>
                                <span>৳ 205,120</span>
                            </div>
                        </div>
                        <button className="w-full bg-gold-500 text-white font-bold py-3 rounded-xl hover:bg-gold-600 transition-colors shadow-lg shadow-gold-100">
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
