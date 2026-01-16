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
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-gold/5 to-transparent pointer-events-none"></div>

                <div className="modal-header">
                    <h2 className="modal-title">New Manufacturing Order</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="space-y-4">
                        <div>
                            <label className="modal-label">Customer Name *</label>
                            <input
                                type="text"
                                name="customer_name"
                                required
                                value={formData.customer_name}
                                onChange={handleChange}
                                className="modal-input"
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div>
                            <label className="modal-label">Items (Product Name) *</label>
                            <input
                                type="text"
                                name="product_name"
                                required
                                value={formData.product_name}
                                onChange={handleChange}
                                className="modal-input"
                                placeholder="e.g. Diamond Ring"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="modal-label">Gold Weight (g)</label>
                                <input
                                    type="number"
                                    name="gold_weight"
                                    step="0.01"
                                    value={formData.gold_weight}
                                    onChange={handleChange}
                                    className="modal-input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="modal-label">Due Date</label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="modal-label">Assign Karigar (Optional)</label>
                            <input
                                type="text"
                                name="karigar_name"
                                value={formData.karigar_name}
                                onChange={handleChange}
                                className="modal-input"
                                placeholder="Karigar Name"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="modal-btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-btn-primary"
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
