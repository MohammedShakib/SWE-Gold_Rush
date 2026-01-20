import React, { useState } from 'react';
import { Star, ShieldCheck, Heart, Share2, MessageCircle, Truck, RefreshCcw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductDetails = () => {
    const [selectedSize, setSelectedSize] = useState('18');

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-gold-600">Home</Link> &gt;
                <Link to="/shop/1" className="hover:text-gold-600 mx-1">Amin Jewellers</Link> &gt;
                <span className="text-gray-900 mx-1">22K Gold Wedding Ring</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-8 flex items-center justify-center relative group">
                        <img src="https://images.unsplash.com/photo-1605100804763-ebea24d54625?q=80&w=1935&auto=format&fit=crop" alt="Product" className="w-full h-full object-contain" />
                        <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500">
                                <Heart size={20} />
                            </button>
                            <button className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-blue-500">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gold-500"></div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Exclusive 22K Gold Wedding Ring</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-gold-500 text-sm">
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                        </div>
                        <span className="text-sm text-gray-500">(24 Reviews)</span>
                        <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck size={14} /> Certified Authentic
                        </span>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                        <div className="text-4xl font-bold text-gold-600">৳ 55,000</div>
                        <div className="text-xl text-gray-400 line-through mb-1">৳ 62,000</div>
                        <div className="text-sm font-bold text-red-500 mb-2 font-mono bg-red-50 px-2 rounded">-11%</div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Info size={16} className="text-gold-500" /> Price Breakdown
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gold Price (22K - 4.5g)</span>
                                <span className="font-medium">৳ 51,750</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Making Charge (Wages)</span>
                                <span className="font-medium text-green-600">৳ 2,500 <span className="text-xs line-through text-gray-400">৳ 5,000</span></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">VAT (5%)</span>
                                <span className="font-medium">৳ 750</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2 font-bold text-gray-900">
                                <span>Total Price</span>
                                <span>৳ 55,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Select Size */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ring Size</label>
                        <div className="flex gap-3">
                            {['16', '18', '20', '22'].map(size => (
                                <button
                                    key={size}
                                    className={`w-12 h-12 rounded-lg border flex items-center justify-center font-medium transition-all ${selectedSize === size ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-8">
                        <button className="flex-1 bg-gold-500 text-white font-bold py-4 rounded-xl hover:bg-gold-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Add to Cart
                        </button>
                        <button className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Buy Now
                        </button>
                    </div>

                    {/* Delivery & Seller Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seller */}
                        <div className="border border-gray-100 p-4 rounded-lg flex items-center gap-3">
                            <div className="w-12 h-12 bg-gold-50 rounded-full flex items-center justify-center font-serif font-bold text-gold-600 border border-gold-200">AJ</div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500">Sold By</div>
                                <div className="font-bold text-gray-900 leading-tight">Amin Jewellers</div>
                                <div className="text-xs text-gold-500 flex items-center gap-1">4.9 <Star size={10} fill="currentColor" /></div>
                            </div>
                            <button className="p-2 text-gold-600 hover:bg-gold-50 rounded-full">
                                <MessageCircle size={20} />
                            </button>
                        </div>

                        {/* Services */}
                        <div className="border border-gray-100 p-4 rounded-lg space-y-2">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <Truck size={16} className="mt-0.5 text-gold-500" />
                                <div>
                                    <span className="font-bold text-gray-900">Free Delivery</span>
                                    <p className="text-xs">By 20 Jan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <RefreshCcw size={16} className="mt-0.5 text-gold-500" />
                                <div>
                                    <span className="font-bold text-gray-900">7 Days Return</span>
                                    <p className="text-xs">Change of mind n/a</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-xs font-medium flex items-center gap-2">
                        <span className="bg-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">U P A Y</span>
                        EMI Available: Up to 6 months installment at 0% interest.
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
