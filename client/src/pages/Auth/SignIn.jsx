import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const SignIn = () => {
    const { language } = useLanguage();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const t = {
        title: language === 'EN' ? 'Welcome Back' : 'ফিরে আসার জন্য স্বাগতম',
        subtitle: language === 'EN' ? 'Sign in to continue to Gold Rush' : 'গোল্ড রাশ-এ চালিয়ে যেতে সাইন ইন করুন',
        emailPlaceholder: language === 'EN' ? 'Email or Phone' : 'ইমেল বা ফোন',
        passwordPlaceholder: language === 'EN' ? 'Password' : 'পাসওয়ার্ড',
        signIn: language === 'EN' ? 'Sign In' : 'সাইন ইন করুন',
        forgotPassword: language === 'EN' ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?',
        noAccount: language === 'EN' ? "Don't have an account?" : 'কোন অ্যাকাউন্ট নেই?',
        signUp: language === 'EN' ? 'Sign Up' : 'সাইন আপ করুন'
    };

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Sign in attempt:', formData);
    };

    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Mouse Follow Spotlight */}
            <div
                className="absolute pointer-events-none z-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 215, 0, 0.15), transparent 40%)`,
                    inset: 0
                }}
            ></div>

            {/* Animated Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary-gold/5 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="w-full max-w-[420px] relative z-10 perspective-1000">
                <div className="text-center mb-10 animate-fade-in-down">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform duration-300">
                            GOLD RUSH
                        </h1>
                    </Link>
                </div>

                <div className="bg-[#121418]/70 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/50 relative overflow-hidden group hover:border-primary-gold/20 transition-all duration-500">
                    {/* Card Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{t.title}</h2>
                        <p className="text-gray-400 text-sm font-medium">{t.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="group/input">
                            <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                <input
                                    type="text"
                                    placeholder={t.emailPlaceholder}
                                    className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-gold/20 to-transparent opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm"></div>
                            </div>
                        </div>

                        <div className="group/input">
                            <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                <input
                                    type="password"
                                    placeholder={t.passwordPlaceholder}
                                    className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-gray-400 hover:text-primary-gold transition-colors duration-300 font-medium">
                                {t.forgotPassword}
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold text-[#0B0D10] font-bold py-4 rounded-2xl shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10">{t.signIn}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </form>

                    <div className="mt-10 text-center relative z-10">
                        <p className="text-gray-400 text-sm">
                            {t.noAccount}{' '}
                            <a href="#" className="text-primary-gold font-bold hover:text-yellow-200 transition-colors ml-1 inline-block hover:underline decoration-primary-gold/50 underline-offset-4">
                                {t.signUp}
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center flex justify-center gap-6 text-xs text-gray-500">
                    <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
