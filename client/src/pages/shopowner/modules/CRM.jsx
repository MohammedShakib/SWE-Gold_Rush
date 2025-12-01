const CRM = () => {
    const customers = [
        { id: 1, name: 'Mrs. Fatema Begum', phone: '01712345678', type: 'VIP', visits: 12, spent: '৳ 5,20,000', lastVisit: '2 days ago' },
        { id: 2, name: 'Mr. Rahim Uddin', phone: '01812345678', type: 'Regular', visits: 5, spent: '৳ 1,50,000', lastVisit: '1 week ago' },
        { id: 3, name: 'Ms. Sadia Islam', phone: '01912345678', type: 'New', visits: 1, spent: '৳ 45,000', lastVisit: 'Today' },
    ];

    return (
        <div className="space-y-8 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">CRM & Communication</h1>
                    <p className="text-gray-400 mt-1">Customer relationships and marketing.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#121418] text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5">
                        Import Contacts
                    </button>
                    <button className="bg-primary-gold text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Customer List */}
                <div className="lg:col-span-2 flex flex-col bg-[#121418] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Customer Database</h2>
                        <input type="text" placeholder="Search by name or phone..." className="bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-primary-gold/50" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customers.map((customer) => (
                            <div key={customer.id} className="bg-[#0B0D10] p-5 rounded-xl border border-white/5 hover:border-primary-gold/30 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-primary-gold transition-colors">{customer.name}</h3>
                                            <p className="text-xs text-gray-500">{customer.phone}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${customer.type === 'VIP' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            customer.type === 'New' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                        {customer.type}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <p className="text-gray-500 text-xs">Total Spent</p>
                                        <p className="text-white font-bold">{customer.spent}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Last Visit</p>
                                        <p className="text-white">{customer.lastVisit}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg text-xs transition-colors">View Profile</button>
                                    <button className="flex-1 bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-gold py-2 rounded-lg text-xs transition-colors">Message</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Communication Hub */}
                <div className="bg-[#121418] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#121418] to-primary-gold/5">
                        <h2 className="text-xl font-bold text-white">Quick Message</h2>
                        <p className="text-xs text-gray-400 mt-1">Send offers or updates to customers.</p>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Select Channel</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button className="bg-green-500/10 border border-green-500/20 text-green-400 py-2 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-colors">WhatsApp</button>
                                <button className="bg-blue-500/10 border border-blue-500/20 text-blue-400 py-2 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors">SMS</button>
                                <button className="bg-red-500/10 border border-red-500/20 text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors">Email</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Recipients</label>
                            <select className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary-gold">
                                <option>All VIP Customers</option>
                                <option>Customers with Due Payments</option>
                                <option>Recent Visitors (Last 30 Days)</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-gray-400 text-sm mb-2">Message</label>
                            <textarea
                                className="w-full h-32 bg-[#0B0D10] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary-gold resize-none"
                                placeholder="Type your message here... (e.g., New Collection Alert!)"
                            ></textarea>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">0 / 160 characters</span>
                                <button className="text-xs text-primary-gold hover:underline">Insert Template</button>
                            </div>
                        </div>

                        <button className="w-full bg-primary-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            Send Blast
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;
