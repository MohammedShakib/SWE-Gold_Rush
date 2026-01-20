import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, TrendingUp, Search } from 'lucide-react';
import api from '../api/axios';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (query) {
                try {
                    const res = await api.get(`/search?q=${query}`);
                    setResults(res.data);
                } catch (err) {
                    console.error('Search failed:', err);
                    setResults([]);
                }
            } else {
                setResults([]);
            }
        };
        fetchSearchResults();
    }, [query]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Search Results for "{query}"
            </h1>

            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {results.map((product) => (
                        <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group block">
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                <img
                                    src={product.img}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={(e) => e.preventDefault()}>
                                    <Heart size={18} />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-gold-600 font-medium mb-1">{product.shop}</div>
                                <h4 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h4>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">৳ {product.price.toLocaleString()}</div>
                                        {product.oldPrice && <div className="text-xs text-gray-500 line-through">৳ {product.oldPrice.toLocaleString()}</div>}
                                    </div>
                                    <button className="bg-gold-100 text-gold-700 p-2 rounded-lg hover:bg-gold-500 hover:text-white transition-colors">
                                        <TrendingUp size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500">We couldn't find any products matching "{query}". <br /> Try checking for typos or using different keywords.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
