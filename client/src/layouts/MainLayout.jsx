import React from 'react';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

import { allProducts } from '../data/dummyProducts';

const Header = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const navigate = useNavigate();
    const searchRef = React.useRef(null);

    // Filter suggestions when query changes
    React.useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = allProducts.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.shop.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    // Close suggestions when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (id) => {
        navigate(`/product/${id}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            {/* Top Bar */}
            <div className="bg-gold-900 text-gold-100 py-1 text-xs text-center font-medium">
                Gold Rate Today: 22K - 11,500/g | 21K - 11,000/g | 18K - 9,500/g
            </div>

            <div className="container mx-auto px-4 py-4 md:py-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="text-2xl md:text-3xl font-serif font-bold text-gold-600 tracking-wide">
                        Gold Lagbe!
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                                placeholder="Search for Rings, Necklaces, Coins..."
                                className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all shadow-sm"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold-500 text-white p-2 rounded-full hover:bg-gold-600 transition-colors">
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Autosuggest Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                {suggestions.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleSuggestionClick(product.id)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        <img src={product.img} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">{product.name}</h4>
                                            <p className="text-xs text-gold-600">{product.shop}</p>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    onClick={(e) => handleSearch(e)}
                                    className="p-3 text-center text-sm text-gold-600 font-medium hover:bg-gray-50 cursor-pointer"
                                >
                                    View all results
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-4 text-gray-700">
                        <button className="md:hidden">
                            <Search size={24} />
                        </button>
                        <Link to="/wishlist" className="hover:text-gold-600 transition-colors relative">
                            <Heart size={24} />
                        </Link>
                        <Link to="/cart" className="hover:text-gold-600 transition-colors relative">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                2
                            </span>
                        </Link>
                        <Link to="/profile" className="hover:text-gold-600 transition-colors hidden md:block">
                            <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 hover:border-gold-300 transition-all">
                                <img
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover shadow-sm bg-gold-50"
                                />
                            </div>
                        </Link>
                        <button className="md:hidden">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <form onSubmit={handleSearch} className="my-3 md:hidden relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-gold-500 outline-none"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </button>
                </form>
            </div>
        </header>
    );
};



const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
