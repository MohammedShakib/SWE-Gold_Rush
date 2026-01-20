import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, TrendingUp, Heart, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [topShops, setTopShops] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsRes = await api.get('/products/trending');
                setTrendingProducts(productsRes.data);

                const shopsRes = await api.get('/shops/top-rated');
                setTopShops(shopsRes.data);
            } catch (err) {
                console.error('Failed to fetch home data:', err);
            }
        };
        fetchData();
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        const container = document.getElementById('trending-carousel');
        if (!container) return;

        const interval = setInterval(() => {
            if (container.getAttribute('data-paused') !== 'true') {
                if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [trendingProducts]); // Re-run when products load

    return (
        <div className="space-y-12">
            {/* Live Price Ticker - More prominent version */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gold-100 flex items-center overflow-hidden">
                <div className="flex-shrink-0 bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs font-bold mr-4 animate-pulse">
                    LIVE RATES
                </div>
                <div className="flex-1 overflow-hidden relative mask-linear-fade">
                    <div className="flex w-max hover:pause-animation">
                        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap px-4">
                            <span className="text-sm font-medium">🔥 22K Gold: 11,500 BDT/g</span>
                            <span className="text-sm font-medium">✨ 21K Gold: 11,000 BDT/g</span>
                            <span className="text-sm font-medium">💎 18K Gold: 9,500 BDT/g</span>
                            <span className="text-sm font-medium text-gray-400">|</span>
                            <span className="text-sm font-medium">🔥 22K Gold: 11,500 BDT/g</span>
                            <span className="text-sm font-medium">✨ 21K Gold: 11,000 BDT/g</span>
                        </div>
                        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap px-4">
                            <span className="text-sm font-medium">🔥 22K Gold: 11,500 BDT/g</span>
                            <span className="text-sm font-medium">✨ 21K Gold: 11,000 BDT/g</span>
                            <span className="text-sm font-medium">💎 18K Gold: 9,500 BDT/g</span>
                            <span className="text-sm font-medium text-gray-400">|</span>
                            <span className="text-sm font-medium">🔥 22K Gold: 11,500 BDT/g</span>
                            <span className="text-sm font-medium">✨ 21K Gold: 11,000 BDT/g</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero / Flash Sale Section */}
            <section className="relative rounded-2xl overflow-hidden shadow-xl aspect-[21/9] md:aspect-[3/1] bg-gradient-to-r from-gray-900 to-gray-800 text-white group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610375461490-fb4133a2f00b?q=80&w=2070&auto=format&fit=crop')] bg-center bg-cover opacity-40 transition-transform duration-1000 group-hover:scale-105"></div>

                {/* Floating Animations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 right-[10%] text-gold-300 animate-float opacity-60">
                        <Gem size={48} />
                    </div>
                    <div className="absolute bottom-10 right-[20%] text-gold-200 animate-float-delayed opacity-40">
                        <Gem size={32} />
                    </div>
                    <div className="absolute top-1/2 right-[5%] text-white animate-sparkle opacity-80">
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div className="absolute top-20 right-[30%] text-gold-400 animate-sparkle opacity-50" style={{ animationDelay: '1s' }}>
                        <Star size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16">
                    <span className="text-gold-400 font-bold tracking-wider mb-2 animate-fade-in">GOLD RUSH SPECIAL</span>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Wedding Season Sale</h1>
                    <p className="text-gray-200 mb-6 max-w-lg">Flat 5% Off on Making Charges for all Bridal Sets. Valid for next 2 hours only.</p>
                    <button className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-full font-bold w-max transition-all hover:scale-105 hover:shadow-lg hover:shadow-gold-500/30">
                        Shop Now
                    </button>
                </div>
            </section>

            {/* Categories */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Browse by Category</h2>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 text-center">
                    {[
                        { name: 'Rings', img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gold_Ring.JPG?width=500' },
                        { name: 'Chains', img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gold_Franco_chain_4.jpg?width=500' },
                        { name: 'Necklaces', img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gold-jewellery-jewel-henry-designs-terabass.jpg?width=500' },
                        { name: 'Bangles', img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangles_Ornaments.jpg?width=500' },
                        { name: 'Earrings', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Coins', img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Coins-jewelery.jpg?width=500' },
                        { name: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Gifts', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60' }
                    ].map((cat) => (
                        <div key={cat.name} className="group cursor-pointer">
                            <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full shadow-md flex items-center justify-center mb-3 border border-transparent group-hover:border-gold-400 transition-all group-hover:shadow-lg overflow-hidden">
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gold-700">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Top Shops (Brand Zone) */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Premium Jewelers</h2>
                    <a href="#" className="text-gold-600 font-medium flex items-center hover:underline">View All <ArrowRight size={16} className="ml-1" /></a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {topShops.map((shop, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto mb-4 flex items-center justify-center font-serif font-bold text-gold-600 text-xl border border-gold-200 overflow-hidden">
                                {shop.logo_url ? <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" /> : shop.shop_name[0]}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">{shop.shop_name}</h3>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                                <Star size={12} fill="#D4AF37" className="text-gold-500" /> {shop.rating} Rating
                            </div>
                            <Link to={`/shop/${shop.shop_slug}`} className="inline-block text-gold-600 text-sm font-medium border border-gold-200 px-4 py-1 rounded-full hover:bg-gold-50">Visit Shop</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products Carousel */}
            <section className="relative group">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Trending Now</h2>
                    <Link to="/search" className="text-gold-600 font-medium flex items-center hover:underline">View All <ArrowRight size={16} className="ml-1" /></Link>
                </div>

                <div className="relative">
                    {/* Left Arrow */}
                    <button
                        onClick={() => {
                            const container = document.getElementById('trending-carousel');
                            container.scrollBy({ left: -300, behavior: 'smooth' });
                        }}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-gray-600 hover:text-gold-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ArrowRight size={20} className="rotate-180" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => {
                            const container = document.getElementById('trending-carousel');
                            container.scrollBy({ left: 300, behavior: 'smooth' });
                        }}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 text-gray-600 hover:text-gold-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ArrowRight size={20} />
                    </button>

                    <div
                        id="trending-carousel"
                        className="flex gap-6 overflow-x-auto pb-0 scrollbar-hide scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                        onMouseEnter={(e) => e.currentTarget.setAttribute('data-paused', 'true')}
                        onMouseLeave={(e) => e.currentTarget.setAttribute('data-paused', 'false')}
                    >
                        {trendingProducts.map((product) => (
                            <Link to={`/product/${product.id}`} key={product.id} className="min-w-[280px] md:min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group/card block">
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={product.image_url || "https://via.placeholder.com/300?text=No+Image"}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-500"
                                    />
                                    <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity hover:text-red-500" onClick={(e) => e.preventDefault()}>
                                        <Heart size={18} />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h4>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">৳ {product.price ? product.price.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <button className="bg-gold-100 text-gold-700 p-2 rounded-lg hover:bg-gold-500 hover:text-white transition-colors">
                                            <TrendingUp size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};



export default Home;
