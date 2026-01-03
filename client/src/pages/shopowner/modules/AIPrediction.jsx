const AIPrediction = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Gold Price Prediction</h1>
                    <p className="text-gray-400 mt-1">Market forecasting powered by Machine Learning.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Model Accuracy</p>
                    <p className="text-xl font-bold text-green-400">94.5%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-[#121418] rounded-2xl border border-white/5 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Price Trend Forecast (Next 7 Days)</h2>
                        <select className="bg-[#0B0D10] border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none">
                            <option>22K Gold</option>
                            <option>21K Gold</option>
                            <option>18K Gold</option>
                            <option>Silver</option>
                        </select>
                    </div>

                    {/* Mock Chart Visualization */}
                    <div className="flex-1 relative min-h-[300px] bg-gradient-to-b from-primary-gold/5 to-transparent rounded-xl border border-white/5 p-4 flex items-end justify-between gap-2">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                            <div className="border-t border-white/20 w-full h-0"></div>
                            <div className="border-t border-white/20 w-full h-0"></div>
                            <div className="border-t border-white/20 w-full h-0"></div>
                            <div className="border-t border-white/20 w-full h-0"></div>
                            <div className="border-t border-white/20 w-full h-0"></div>
                        </div>

                        {/* Bars / Points */}
                        {[60, 65, 55, 70, 75, 85, 80].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full group relative">
                                <div
                                    className="w-full max-w-[40px] bg-primary-gold/20 border-t-2 border-primary-gold rounded-t-sm transition-all duration-500 hover:bg-primary-gold/40 relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ৳ {(11000 + (h * 10)).toLocaleString()}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prediction Stats & Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#121418] to-primary-gold/10 p-6 rounded-2xl border border-primary-gold/30">
                        <h3 className="text-gray-400 text-sm mb-1">Tomorrow's Prediction</h3>
                        <div className="flex items-end gap-2">
                            <h2 className="text-4xl font-bold text-white">৳ 11,350</h2>
                            <span className="text-green-400 font-bold mb-1 text-sm">▲ +1.2%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Predicted High: ৳ 11,400 | Low: ৳ 11,280</p>
                        <button className="w-full mt-6 bg-primary-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20">
                            Adjust Shop Prices
                        </button>
                    </div>

                    <div className="bg-[#121418] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-4">Market Insights</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                                <div>
                                    <p className="text-sm text-white font-medium">Global Inflation Impact</p>
                                    <p className="text-xs text-gray-500">Rising inflation rates in US market may push gold prices up.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                <div>
                                    <p className="text-sm text-white font-medium">Wedding Season Demand</p>
                                    <p className="text-xs text-gray-500">Local demand expected to rise by 15% next week.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPrediction;
