import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Edit, Trash2, Eye, X, Check } from 'lucide-react';
import CustomAlert from '../../../components/CustomAlert';

const Sales = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const location = useLocation();

    // Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({ isOpen: true, title, message, type, onConfirm });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        // Fetch Products
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

        // Check for Payment Status
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status === 'success') {
            showAlert('Payment Successful', 'The sale has been recorded successfully.', 'success');
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            setCart([]);
        } else if (status === 'failed') {
            showAlert('Payment Failed', 'The transaction was declined or failed.', 'danger');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock_quantity) {
                    showAlert('Stock Limit', 'Cannot add more than available stock.', 'danger');
                    return prev;
                }
                return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const decreaseQty = (productId) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === productId);
            if (existing.qty === 1) {
                return prev.filter(p => p.id !== productId);
            }
            return prev.map(p => p.id === productId ? { ...p, qty: p.qty - 1 } : p);
        });
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        showAlert('Clear Cart?', 'Are you sure you want to remove all items?', 'danger', () => setCart([]));
    };

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.product_code && product.product_code.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const inStock = product.status !== 'Out of Stock' && product.stock_quantity > 0;
        return matchesSearch && matchesCategory && inStock;
    });

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Payment Handler
    const handlePayment = async () => {
        if (cart.length === 0) {
            showAlert('Cart Empty', 'Please add items to the cart first.', 'danger');
            return;
        }

        try {
            const res = await fetch('/api/payment/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart })
            });
            const data = await res.json();

            if (data.url) {
                window.location.replace(data.url);
            } else {
                showAlert('Payment Error', 'Could not initiate payment gateway.', 'danger');
            }
        } catch (error) {
            console.error("Payment error:", error);
            showAlert('System Error', 'Failed to connect to payment server.', 'danger');
        }
    };

    // Edit Logic
    const [editingSale, setEditingSale] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const handleEditSale = (sale) => {
        setEditingSale(sale);
        setNewStatus(sale.status);
    };

    // View Logic
    const [viewingSaleDetails, setViewingSaleDetails] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const handleViewSale = (id) => {
        // Optimistic update: Show modal immediately with available data
        const sale = salesHistory.find(s => s.id === id);
        if (sale) {
            setViewingSaleDetails({ sale, items: [] });
        }

        setViewLoading(true);
        fetch(`/api/sales/${id}`)
            .then(res => res.json())
            .then(data => {
                setViewingSaleDetails(data);
                setViewLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch sale details", err);
                showAlert('Error', 'Failed to load items.', 'danger');
                setViewLoading(false);
            });
    };

    const updateStatus = () => {
        if (!editingSale) return;

        fetch(`/api/sales/${editingSale.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
            .then(res => {
                if (res.ok) {
                    setSalesHistory(prev => prev.map(s => s.id === editingSale.id ? { ...s, status: newStatus } : s));
                    showAlert('Updated', 'Sale status updated successfully.', 'success');
                    setEditingSale(null);
                } else {
                    showAlert('Error', 'Failed to update status.', 'danger');
                }
            })
            .catch(err => console.error(err));
    };

    // Delete Handler
    const handleDeleteSale = (id) => {
        showAlert('Delete Record?', 'This action cannot be undone.', 'danger', () => {
            fetch(`/api/sales/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        setSalesHistory(prev => prev.filter(sale => sale.id !== id));
                        showAlert('Deleted', 'Sale record deleted successfully.', 'success');
                    } else {
                        showAlert('Error', 'Failed to delete record.', 'danger');
                    }
                })
                .catch(err => console.error(err));
        });
    };

    const [activeTab, setActiveTab] = useState('pos');
    const [salesHistory, setSalesHistory] = useState([]);

    // Fetch Sales History when tab changes
    useEffect(() => {
        if (activeTab === 'history') {
            setLoading(true);
            fetch('/api/sales')
                .then(res => res.json())
                .then(data => {
                    setSalesHistory(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch sales history", err);
                    setLoading(false);
                });
        }
    }, [activeTab]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-fade-in relative">
            <CustomAlert
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
            />

            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                    <h1 className="text-3xl font-bold text-white">Sales & Invoicing</h1>
                    <div className="flex bg-[#121418] p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('pos')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pos' ? 'bg-primary-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            New Sale (POS)
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Sales History
                        </button>
                    </div>
                </div>

                {activeTab === 'pos' && (
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 absolute left-3 top-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                )}
            </div>

            {activeTab === 'pos' ? (
                <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                    {/* Left Side: Product Grid */}
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Categories */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none flex-shrink-0">
                            {['All', 'Necklace', 'Ring', 'Earring', 'Bangle', 'Chain'].map((cat, i) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary-gold text-black' : 'bg-[#121418] text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pr-2 flex-1 content-start">
                            {loading ? <div className="text-white col-span-full text-center py-20 flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400">Loading Inventory...</p>
                            </div> :
                                filteredProducts.length === 0 ? (
                                    <div className="text-gray-500 col-span-full text-center py-20 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl">🔍</div>
                                        <p>No products found matching your criteria.</p>
                                    </div>
                                ) :
                                    filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="group relative bg-gradient-to-b from-[#1E2126] to-[#121418] border border-white/5 p-4 rounded-2xl cursor-pointer hover:border-primary-gold/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,215,0,0.10)] hover:-translate-y-1 flex flex-col h-full overflow-hidden"
                                        >
                                            {/* Image Container */}
                                            <div className="aspect-square bg-[#0B0D10] rounded-xl mb-3 relative overflow-hidden flex items-center justify-center group-hover:shadow-inner transition-all">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                                                    />
                                                ) : (
                                                    <div className="text-4xl text-gray-700 group-hover:text-primary-gold/80 transition-colors duration-300 transform group-hover:scale-110">
                                                        💍
                                                    </div>
                                                )}

                                                {/* Stock Badge */}
                                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide backdrop-blur-md border shadow-lg ${product.stock_quantity > 0
                                                    ? 'bg-black/60 text-white border-white/10'
                                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                    }`}>
                                                    {product.stock_quantity > 0 ? `${product.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col flex-1">
                                                <h3 className="font-semibold text-white/90 text-base mb-1 truncate leading-tight group-hover:text-primary-gold transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.category} • {product.product_code || 'N/A'}</p>

                                                <div className="mt-auto flex items-center justify-between gap-2">
                                                    <div className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                        <p className="text-xs text-gray-400 font-medium">{product.weight}g</p>
                                                    </div>
                                                    <div className="bg-primary-gold/10 px-3 py-1 rounded-md border border-primary-gold/20 group-hover:bg-primary-gold hover:border-primary-gold transition-colors">
                                                        <p className="text-primary-gold font-bold text-base group-hover:text-black transition-colors">
                                                            ৳ {product.price?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-gold/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                                        </div>
                                    ))}
                        </div>
                    </div>

                    {/* Right Side: Cart / Invoice */}
                    <div className="w-full lg:w-96 bg-[#121418] border-l border-white/10 flex flex-col h-full rounded-2xl lg:rounded-none lg:bg-transparent lg:border-l-0 lg:border-white/10">
                        <div className="bg-[#121418] rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="font-bold text-white">Current Order</h2>
                                <button onClick={clearCart} className="text-red-400 text-xs hover:underline disabled:opacity-50" disabled={cart.length === 0}>Clear All</button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                        </svg>
                                        <p className="text-sm">Cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5 animate-fade-in-up">
                                            <div>
                                                <p className="text-white font-medium text-sm truncate w-32">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.weight}g x {item.qty}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-sm">৳ {(item.price * item.qty).toLocaleString()}</p>
                                                <div className="flex items-center gap-2 justify-end mt-1">
                                                    <button onClick={() => decreaseQty(item.id)} className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">-</button>
                                                    <button onClick={() => addToCart(item)} className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
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

                                <button onClick={handlePayment} className="w-full bg-primary-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={cart.length === 0}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                    Process Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto bg-[#121418] border border-white/5 rounded-2xl">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="py-4 px-4 font-medium">Date</th>
                                        <th className="py-4 px-4 font-medium">Transaction ID</th>
                                        <th className="py-4 px-4 font-medium">Method</th>
                                        <th className="py-4 px-4 font-medium text-right">Amount</th>
                                        <th className="py-4 px-4 font-medium text-center">Status</th>
                                        <th className="py-4 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-500">Loading history...</td>
                                        </tr>
                                    ) : salesHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-500">No sales history found.</td>
                                        </tr>
                                    ) : (
                                        salesHistory.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 text-gray-300">{new Date(sale.sale_date).toLocaleDateString()} {new Date(sale.sale_date).toLocaleTimeString()}</td>
                                                <td className="py-4 px-4 text-white font-mono text-xs">{sale.transaction_id}</td>
                                                <td className="py-4 px-4 text-gray-300">{sale.payment_method}</td>
                                                <td className="py-4 px-4 text-right text-primary-gold font-bold">৳ {sale.final_amount.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${sale.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        sale.status === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                        }`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewSale(sale.id)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditSale(sale)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                                                            title="Edit Status"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSale(sale.id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {editingSale && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setEditingSale(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Update Status</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Transaction ID</label>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-gray-300 font-mono text-sm">
                                    {editingSale.transaction_id}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Pending', 'Completed', 'Failed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`py-2 rounded-lg text-sm font-bold border transition-all ${newStatus === status
                                                ? status === 'Completed' ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                    : status === 'Failed' ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={updateStatus}
                                className="w-full bg-primary-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary-gold/20 flex justify-center items-center gap-2 mt-4"
                            >
                                <Check size={18} />
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingSaleDetails && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#121418] border border-white/10 rounded-2xl w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Sale Details</h2>
                                <p className="text-sm text-gray-400 font-mono mt-1">{viewingSaleDetails.sale.transaction_id}</p>
                            </div>
                            <button
                                onClick={() => setViewingSaleDetails(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Sale Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                                    <p className="text-white text-sm">{new Date(viewingSaleDetails.sale.sale_date).toLocaleDateString()}</p>
                                    <p className="text-gray-400 text-xs">{new Date(viewingSaleDetails.sale.sale_date).toLocaleTimeString()}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Method</p>
                                    <p className="text-white text-sm">{viewingSaleDetails.sale.payment_method}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${viewingSaleDetails.sale.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                        viewingSaleDetails.sale.status === 'Failed' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {viewingSaleDetails.sale.status}
                                    </span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total</p>
                                    <p className="text-primary-gold font-bold text-lg">৳ {viewingSaleDetails.sale.final_amount.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary-gold rounded-full"></span>
                                Purchased Items ({viewingSaleDetails.items.length})
                            </h3>
                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                        <tr>
                                            <th className="py-3 px-4 font-medium">Item</th>
                                            <th className="py-3 px-4 font-medium text-center">Qty</th>
                                            <th className="py-3 px-4 font-medium text-right">Price</th>
                                            <th className="py-3 px-4 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {viewLoading && viewingSaleDetails.items.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-6 h-6 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Loading items...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : viewingSaleDetails.items.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500">No items found for this sale.</td>
                                            </tr>
                                        ) : (
                                            viewingSaleDetails.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.image_url ? (
                                                                <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">💎</div>
                                                            )}
                                                            <div>
                                                                <p className="text-white font-medium">{item.product_name}</p>
                                                                <p className="text-xs text-gray-500">{item.product_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-gray-300">x{item.quantity}</td>
                                                    <td className="py-3 px-4 text-right text-gray-300">৳ {item.price_at_sale.toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-right text-white font-bold">৳ {item.total_price.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot className="bg-white/5 border-t border-white/10">
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 text-right text-gray-400">Subtotal</td>
                                            <td className="py-3 px-4 text-right text-gray-300">৳ {viewingSaleDetails.sale.total_amount.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 text-right text-gray-400">Tax (5%)</td>
                                            <td className="py-3 px-4 text-right text-gray-300">৳ {viewingSaleDetails.sale.tax_amount.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 text-right font-bold text-white">Grand Total</td>
                                            <td className="py-3 px-4 text-right font-bold text-primary-gold text-lg">৳ {viewingSaleDetails.sale.final_amount.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
