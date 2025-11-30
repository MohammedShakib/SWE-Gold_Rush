import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [status, setStatus] = useState('');
    const { language } = useLanguage();
    const t = translations[language].contact;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', phone: '', email: '' });
                console.log(data.message);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="section-title !text-left">{t.title}</h2>
                        <p className="section-subtitle !text-left">
                            {t.subtitle}
                        </p>

                        <div className="grid gap-8 mt-12">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-gold/10 flex items-center justify-center text-primary-gold text-xl">
                                    📞
                                </div>
                                <div>
                                    <div className="text-text-dim text-sm">{t.call}</div>
                                    <div className="text-lg font-semibold">+880 1234 567890</div>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-gold/10 flex items-center justify-center text-primary-gold text-xl">
                                    ✉️
                                </div>
                                <div>
                                    <div className="text-text-dim text-sm">{t.email}</div>
                                    <div className="text-lg font-semibold">info@worldsoftzone.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <div>
                                <label className="block mb-2 text-text-dim">{t.form.name}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-lg text-text-light outline-none focus:border-primary-gold transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-text-dim">{t.form.phone}</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-lg text-text-light outline-none focus:border-primary-gold transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-text-dim">{t.form.email}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-lg text-text-light outline-none focus:border-primary-gold transition-colors"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full mt-4">
                                {status === 'sending' ? t.form.sending : t.form.send}
                            </button>

                            {status === 'success' && (
                                <div className="text-green-400 text-center mt-4">
                                    {t.form.success}
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="text-red-400 text-center mt-4">
                                    {t.form.error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
