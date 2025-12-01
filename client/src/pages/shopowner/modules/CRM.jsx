const CRM = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">CRM & Omni-channel Communication</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Database */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Customer Profiles</h2>
                        <input type="text" placeholder="Search Customer..." className="bg-[#0B0D10] border border-white/10 rounded px-3 py-1 text-sm text-white" />
                    </div>
                    <div className="space-y-3">
                        {/* Placeholder Customer */}
                        <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">John Doe</p>
                                <p className="text-xs text-gray-400">01700000000</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary-gold font-bold">500 pts</p>
                                <p className="text-xs text-gray-400">Loyalty Points</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Communication Hub */}
                <div className="bg-[#121418] p-6 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Communication Hub</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white mb-2">Send Notification</h3>
                            <textarea className="w-full bg-[#0B0D10] border border-white/10 rounded p-2 text-white text-sm mb-2" rows="3" placeholder="Type message..."></textarea>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">SMS</button>
                                <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700">WhatsApp</button>
                                <button className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700">Email</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;
