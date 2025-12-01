import { useState } from 'react';

const Sales = () => {
    const [cart, setCart] = useState([
        { id: 1, name: '22K Gold Ring', weight: '4.5g', price: 45000, qty: 1 },
        { id: 2, name: 'Silver Anklet', weight: '12g', price: 3500, qty: 2 },
    ]);

    const products = [
        { id: 1, name: '22K Gold Ring', weight: '4.5g', price: '৳ 45,000', image: '💍' },
        { id: 2, name: 'Silver Anklet', weight: '12g', price: '৳ 3,500', image: '⛓️' },
        { id: 3, name: 'Diamond Studs', weight: '2.1g', price: '৳ 25,000', image: '💎' },
        { id: 4, name: 'Gold Necklace', weight: '15g', price: '৳ 1,50,000', image: '📿' },
        { id: 5, name: 'Platinum Band', weight: '5g', price: '৳ 60,000', image: '💍' },
        { id: 6, name: 'Gold Coin', weight: '10g', price: '৳ 1,10,000', image: '🪙' },
    ];

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-fade-in">
            {/* Left Side: Product Grid */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">New Sale (POS)</h1>
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 pl-10"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 absolute left-3 top-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Rings', 'Necklaces', 'Earrings', 'Bangles', 'Coins'].map((cat, i) => (
                        <button key={cat} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-gold text-black' : 'bg-[#121418] text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
                    {products.map((product) => (
                        <div key={product.id} className="bg-[#121418] p-4 rounded-xl border border-white/5 hover:border-primary-gold/30 cursor-pointer transition-all hover:transform hover:scale-[1.02] group">
                            <div className="aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:bg-white/10 transition-colors">
                                {product.image}
                            </div>
                            <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                            <p className="text-xs text-gray-400 mb-2">{product.weight}</p>
                            <p className="text-primary-gold font-bold">{product.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Cart / Invoice */}
            <div className="w-full lg:w-96 bg-[#121418] border-l border-white/10 flex flex-col h-full rounded-2xl lg:rounded-none lg:bg-transparent lg:border-l-0 lg:border-white/10">
                <div className="bg-[#121418] rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="font-bold text-white">Current Order</h2>
                        <button className="text-red-400 text-xs hover:underline">Clear All</button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                <div>
                                    <p className="text-white font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.weight} x {item.qty}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">৳ {(item.price * item.qty).toLocaleString()}</p>
                                    <div className="flex items-center gap-2 justify-end mt-1">
                                        <button className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20">-</button>
                                        <button className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20">+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Calculation */}
                    <div className="p-6 bg-white/5 border-t border-white/10 space-y-3">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span>৳ {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Tax (5%)</span>
                            <span>৳ {tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Discount</span>
                            <span>- ৳ 0</span>
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-2xl font-bold text-primary-gold">৳ {total.toLocaleString()}</span>
                        </div>

                        <button className="w-full bg-primary-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 mt-4 flex justify-center items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                            Process Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
