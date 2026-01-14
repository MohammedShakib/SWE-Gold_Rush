import { useState, useEffect } from 'react';
import CustomAlert from '../../../components/CustomAlert';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // success, danger, info
        onConfirm: null
    });

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        karat: '22K',
        weight: '',
        price: '',
        stock_quantity: '',
        status: 'In Stock'
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered Products
    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            (product.product_code && product.product_code.toLowerCase().includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query))
        );
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/inventory');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            karat: '22K',
            weight: '',
            price: '',
            stock_quantity: '',
            status: 'In Stock'
        });
        setEditingProduct(null);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                karat: product.karat,
                weight: product.weight,
                price: product.price,
                stock_quantity: product.stock_quantity,
                status: product.status
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingProduct ? `/api/inventory/${editingProduct.id}` : '/api/inventory';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showAlert(
                    'Success',
                    editingProduct ? 'Product updated successfully.' : 'New product added to inventory.',
                    'success'
                );
                setIsModalOpen(false);
                fetchProducts();
                resetForm();
            } else {
                showAlert('Error', 'Failed to save product. Please try again.', 'danger');
            }
        } catch (error) {
            console.error("Error saving product:", error);
            showAlert('Error', 'An unexpected error occurred.', 'danger');
        }
    };

    const handleDelete = async (id) => {
        showAlert(
            'Delete Product?',
            'Are you sure you want to delete this product? This action cannot be undone.',
            'danger',
            async () => {
                try {
                    const response = await fetch(`/api/inventory/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        fetchProducts(); // Refresh list silently or show success
                        // Optional: show secondary success alert
                        // setTimeout(() => showAlert('Deleted', 'Product has been removed.', 'success'), 300);
                    } else {
                        showAlert('Error', 'Failed to delete product.', 'danger');
                    }
                } catch (error) {
                    console.error("Error deleting product:", error);
                }
            }
        );
    };

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
        <div className="space-y-8 animate-fade-in relative">
            {/* Custom Alert */}
            <CustomAlert
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Category</label>
                                    <select
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Necklace">Necklace</option>
                                        <option value="Ring">Ring</option>
                                        <option value="Earring">Earring</option>
                                        <option value="Bangle">Bangle</option>
                                        <option value="Chain">Chain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Karat</label>
                                    <select
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.karat}
                                        onChange={e => setFormData({ ...formData, karat: e.target.value })}
                                    >
                                        <option value="24K">24K</option>
                                        <option value="22K">22K</option>
                                        <option value="21K">21K</option>
                                        <option value="18K">18K</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Weight (g)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Price (BDT)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.stock_quantity}
                                        onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Status</label>
                                    <select
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-gold"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary-gold text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory & Supply Chain</h1>
                    <p className="text-gray-400 mt-1">Manage your jewelry stock and materials.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-primary-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 flex items-center gap-2 w-full md:w-auto justify-center">
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
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-white">Product List</h2>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-gold/50 flex-1 md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            {filteredProducts.map((product) => (
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
                                    <td className="p-4 font-bold text-primary-gold">৳ {product.price?.toLocaleString()}</td>
                                    <td className="p-4">{product.stock_quantity}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="text-gray-500 hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
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
