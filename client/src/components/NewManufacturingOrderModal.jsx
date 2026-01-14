import { useState } from 'react';
import { X } from 'lucide-react';

const NewManufacturingOrderModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        product_name: '',
        karigar_name: '',
        gold_weight: '',
        due_date: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            gold_weight: parseFloat(formData.gold_weight) || 0
        });
        setFormData({
            customer_name: '',
            product_name: '',
            karigar_name: '',
            gold_weight: '',
            due_date: '',
            notes: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121418] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-gold/5 to-transparent pointer-events-none"></div>

                <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                    <h2 className="text-xl font-bold text-white">New Manufacturing Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Customer Name *</label>
                            <input
                                type="text"
                                name="customer_name"
                                required
                                value={formData.customer_name}
                                onChange={handleChange}
                                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 transition-colors"
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Items (Product Name) *</label>
                            <input
                                type="text"
                                name="product_name"
                                required
                                value={formData.product_name}
                                onChange={handleChange}
                                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 transition-colors"
                                placeholder="e.g. Diamond Ring"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Gold Weight (g)</label>
                                <input
                                    type="number"
                                    name="gold_weight"
                                    step="0.01"
                                    value={formData.gold_weight}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Assign Karigar (Optional)</label>
                            <input
                                type="text"
                                name="karigar_name"
                                value={formData.karigar_name}
                                onChange={handleChange}
                                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-gold/50 transition-colors"
                                placeholder="Karigar Name"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-primary-gold text-black font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-primary-gold/20"
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewManufacturingOrderModal;
