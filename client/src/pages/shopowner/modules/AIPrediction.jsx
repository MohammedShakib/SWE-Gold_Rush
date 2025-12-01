const AIPrediction = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI/ML Gold Price Prediction</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prediction Chart Placeholder */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Price Trend Forecast</h2>
                    <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 border-dashed">
                        <p className="text-gray-400">Chart Visualization Placeholder</p>
                    </div>
                </div>

                {/* Prediction Stats */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Daily Prediction</h2>
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-gradient-to-br from-primary-gold/20 to-transparent rounded-xl border border-primary-gold/30">
                            <p className="text-gray-400 mb-2">Predicted Price (Tomorrow)</p>
                            <p className="text-4xl font-bold text-primary-gold">৳ 0.00</p>
                            <p className="text-xs text-green-400 mt-2">▲ +0.0% Expected Increase</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-white text-sm">Model Insights</h3>
                            <p className="text-gray-400 text-sm">
                                Based on linear regression analysis of historical market data, global gold index, and currency fluctuation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPrediction;
