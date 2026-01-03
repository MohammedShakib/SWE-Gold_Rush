import { useState, useEffect } from 'react';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/inventory')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch inventory", err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Stock': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Low Stock': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Out of Stock': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    if (loading) return <div className="text-white">Loading Inventory...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory & Supply Chain</h1>
                    <p className="text-gray-400 mt-1">Manage your jewelry stock and materials.</p>
                </div>
                <button className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add New Product
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Total Items</p>
                    <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-primary-gold mt-1">৳ {products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-sm">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{products.filter(p => p.stock_quantity < 3).length} Items</p>
                </div>
            </div>

            <div className="bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Product List</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-gold/50"
                        />
                        <button className="bg-white/5 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10">Filter</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase font-medium text-gray-300">
                            <tr>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Karat</th>
                                <th className="p-4">Weight</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.product_code}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">{product.category}</td>
                                    <td className="p-4"><span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold">{product.karat}</span></td>
                                    <td className="p-4 font-mono text-white">{product.weight} g</td>
                                    <td className="p-4 font-bold text-primary-gold">৳ {product.price.toLocaleString()}</td>
                                    <td className="p-4">{product.stock_quantity}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
