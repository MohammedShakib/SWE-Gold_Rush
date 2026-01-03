const Manufacturing = () => {
    const workflow = [
        {
            title: 'New Orders',
            color: 'border-blue-500/50',
            badge: 'bg-blue-500/10 text-blue-400',
            items: [
                { id: 'MF-001', item: 'Custom Diamond Ring', customer: 'Mr. Ahmed', date: 'Today' },
                { id: 'MF-002', item: 'Gold Chain Repair', customer: 'Walk-in', date: 'Yesterday' },
            ]
        },
        {
            title: 'In Progress (Molding)',
            color: 'border-yellow-500/50',
            badge: 'bg-yellow-500/10 text-yellow-400',
            items: [
                { id: 'MF-003', item: 'Bridal Set (Necklace)', customer: 'Mrs. Khan', karigar: 'Rahim' },
            ]
        },
        {
            title: 'Polishing & QC',
            color: 'border-purple-500/50',
            badge: 'bg-purple-500/10 text-purple-400',
            items: [
                { id: 'MF-004', item: 'Gold Bangle Pair', customer: 'Ms. Nusrat', status: 'QC Pending' },
            ]
        },
        {
            title: 'Ready for Delivery',
            color: 'border-green-500/50',
            badge: 'bg-green-500/10 text-green-400',
            items: [
                { id: 'MF-005', item: 'Silver Anklet', customer: 'Mr. Karim', status: 'Ready' },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manufacturing Workflow</h1>
                    <p className="text-gray-400 mt-1">Track production from order to delivery.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#121418] px-4 py-2 rounded-lg border border-white/10 text-sm">
                        <span className="text-gray-400">Gold Allocated:</span> <span className="text-primary-gold font-bold">125.5 g</span>
                    </div>
                    <button className="bg-primary-gold text-black px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                        New Order
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {workflow.map((column, idx) => (
                        <div key={idx} className="flex-1 bg-[#121418] rounded-2xl border border-white/5 flex flex-col min-w-[300px]">
                            <div className={`p-4 border-b border-white/5 flex justify-between items-center border-t-4 ${column.color} rounded-t-2xl`}>
                                <h3 className="font-bold text-white">{column.title}</h3>
                                <span className="bg-white/5 text-gray-400 px-2 py-0.5 rounded text-xs">{column.items.length}</span>
                            </div>
                            <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                {column.items.map((item) => (
                                    <div key={item.id} className="bg-[#0B0D10] p-4 rounded-xl border border-white/5 hover:border-white/20 cursor-pointer transition-all hover:shadow-lg group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-gray-500 font-mono">{item.id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${column.badge}`}>
                                                {item.status || 'Active'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white mb-1 group-hover:text-primary-gold transition-colors">{item.item}</h4>
                                        <p className="text-sm text-gray-400 mb-3">{item.customer}</p>

                                        {item.karigar && (
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">K</div>
                                                <span className="text-xs text-gray-400">Karigar: {item.karigar}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button className="w-full py-2 border border-dashed border-white/10 rounded-xl text-gray-500 text-sm hover:bg-white/5 hover:text-white transition-colors">
                                    + Add Item
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Manufacturing;
