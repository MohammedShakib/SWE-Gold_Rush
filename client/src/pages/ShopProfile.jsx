import React, { useEffect, useState } from 'react';
import { MapPin, Star, UserPlus, MessageCircle, Ticket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const ShopProfile = () => {
    const { slug } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const shopRes = await api.get(`/shops/${slug}`);
                setShop(shopRes.data);

                const productsRes = await api.get(`/shops/${slug}/products`);
                setProducts(productsRes.data);
            } catch (err) {
                console.error('Failed to fetch shop data:', err);
            }
        };
        if (slug) fetchShopData();
    }, [slug]);

    if (!shop) return <div className="text-center py-20">Loading Shop...</div>;

    return (
        <div className="space-y-8">
            {/* Shop Banner & Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="h-48 md:h-64 bg-gray-800 relative">
                    <img
                        src={shop.banner_url || "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop"}
                        alt="Shop Banner"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        {/* Shop Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-lg ring-4 ring-white overflow-hidden">
                            {shop.logo_url ?
                                <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover rounded-full" /> :
                                <div className="w-full h-full bg-gold-50 rounded-full flex items-center justify-center border border-gold-100">
                                    <span className="text-3xl md:text-4xl font-serif font-bold text-gold-600">{shop.shop_name[0]}</span>
                                </div>
                            }
                        </div>

                        <div className="flex-1 text-white md:text-gray-900 md:mb-2">
                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-shadow-sm md:text-shadow-none">{shop.shop_name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-300 md:text-gray-500 mt-1">
                                <MapPin size={14} />
                                <span>{shop.shop_address || shop.branch || 'Location Main'}</span>
                                <span className="mx-1">•</span>
                                <div className="flex items-center text-gold-500">
                                    <Star size={14} fill="currentColor" /> <span className="ml-1 font-bold text-white md:text-gray-700">{shop.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gold-500 text-white px-6 py-2 rounded-full font-bold hover:bg-gold-600 transition-colors">
                                <UserPlus size={18} /> Follow
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-50 hover:border-gold-300 transition-colors">
                                <MessageCircle size={18} /> Chat
                            </button>
                        </div>
                    </div>

                    {/* Vouchers Section */}
                    {/* ... Keep voucher section logic same or dynamic if needed ... */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-gold-50 to-white border border-gold-200 border-l-4 border-l-gold-500 p-3 rounded-lg flex justify-between items-center shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-gold-700 font-bold text-lg">5% OFF</div>
                                <div className="text-xs text-gray-500">Min. Spend 50k</div>
                            </div>
                            <button className="relative z-10 text-xs font-bold bg-gold-500 text-white px-3 py-1.5 rounded-full hover:bg-gold-600">Collect</button>
                            <Ticket className="absolute -right-4 -bottom-4 text-gold-100 w-24 h-24 rotate-12" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Content */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters - Keep Static for Demo */}
                <div className="w-full md:w-64 flex-shrink-0 hidden md:block">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Categories</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" /> Rings</label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" /> Necklaces</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">All Products ({products.length})</h2>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group block">
                                    <div className="aspect-square bg-gray-100 relative">
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{product.name}</h4>
                                        <div className="text-lg font-bold text-gold-600">৳ {product.price.toLocaleString()}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">No products found in this shop.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopProfile;
