import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import goldRushBg from '../../assets/goldrush1.png';
import LocationPicker from '../../components/LocationPicker';
import { useLanguage } from '../../context/LanguageContext';

const authTranslations = {
    EN: {
        signUpTitle: 'Start Your Journey',
        signUpSubtitle: 'Join Gold Rush to manage your jewellery business.',
        shopDetailsTitle: 'Setup Shop',
        shopDetailsSubtitle: 'Tell us about your jewellery business.',
        fullNamePlaceholder: 'Full Name',
        phonePlaceholder: 'Phone Number',
        confirmPasswordPlaceholder: 'Confirm Password',
        shopNamePlaceholder: 'Shop Name',
        branchCountPlaceholder: 'Number of Branches',
        taxIdPlaceholder: 'Tax ID / BIN',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        yesAccount: 'Already a member?',
        signUp: 'Create Account',
        next: 'Next Step',
        back: 'Back',
        signInLink: 'Sign In',
        tagline: 'Manage your Jewellery Shop with Confidence.'
    }
};
authTranslations.BN = authTranslations.EN;

const SignUp = () => {
    const { language } = useLanguage();
    const t = authTranslations[language] || authTranslations.EN;

    const [step, setStep] = useState(1);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        fullName: '',
        phone: '',
        confirmPassword: '',
        shop_name: '',
        branch_count: '',
        tax_id: ''
    });
    const [location, setLocation] = useState(null);

    const navigate = useNavigate();
    const handleChange = (key) => (e) => {
        setFormError('');
        const raw = e.target.value;
        const nextValue = key === 'tax_id' ? raw.toUpperCase() : raw;
        setFormData((prev) => ({ ...prev, [key]: nextValue }));
    };

    const validateStep1 = () => {
        const missing = !formData.fullName.trim() || !formData.phone.trim() || !formData.identifier.trim() || !formData.password.trim() || !formData.confirmPassword.trim();
        if (missing) {
            setFormError('Please fill in all fields.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match.');
            return false;
        }
        setFormError('');
        return true;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const isStep1Complete = !!(formData.fullName.trim() && formData.phone.trim() && formData.identifier.trim() && formData.password.trim() && formData.confirmPassword.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (step === 1) {
            handleNext(e);
            return;
        }

        if (!formData.shop_name.trim()) {
            setFormError('Shop name is required.');
            return;
        }

        if (!location) {
            setFormError('Please select your shop location on the map.');
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    latitude: location.lat,
                    longitude: location.lng,
                    plan: 'free',
                    amount: 0
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/subscription', { state: { user: data.user } });
            } else {
                setFormError(data.error || 'Signup Failed');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setFormError('Something went wrong.');
        }
    };

    // Bubble Animation Logic
    const [bubbles, setBubbles] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const generateBubbles = () => {
            const newBubbles = [];
            for (let i = 0; i < 20; i++) {
                newBubbles.push({
                    id: i,
                    size: Math.random() * 60 + 20,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2
                });
            }
            setBubbles(newBubbles);
        };
        generateBubbles();
    }, []);

    useEffect(() => {
        let frameId;
        const animateBubbles = () => {
            setBubbles(prevBubbles => prevBubbles.map(bubble => {
                let { x, y, speedX, speedY } = bubble;
                x += speedX;
                y += speedY;

                const dx = (x / 100 * window.innerWidth) - mouseRef.current.x;
                const dy = (y / 100 * window.innerHeight) - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    const force = (200 - distance) / 200;
                    x += (dx / distance) * force * 0.5;
                    y += (dy / distance) * force * 0.5;
                }

                if (x < -10) x = 110;
                if (x > 110) x = -10;
                if (y < -10) y = 110;
                if (y > 110) y = -10;

                return { ...bubble, x, y };
            }));
            frameId = requestAnimationFrame(animateBubbles);
        };
        frameId = requestAnimationFrame(animateBubbles);
        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary-gold/30 selection:text-white">
            <div
                className="absolute pointer-events-none z-0 transition-opacity duration-500 hidden lg:block"
                style={{
                    background: `radial-gradient(1200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 182, 34, 0.05), transparent 40%)`,
                    inset: 0
                }}
            ></div>

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                {bubbles.map((bubble) => (
                    <div
                        key={bubble.id}
                        className="absolute rounded-full bubble-glow animate-float-around"
                        style={{
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            left: `${bubble.x}%`,
                            top: `${bubble.y}%`,
                            opacity: Math.min(0.95, 0.55 + bubble.size / 200),
                            willChange: 'transform, left, top'
                        }}
                    ></div>
                ))}
            </div>

            <div className="w-full max-w-[1400px] h-[850px] bg-white rounded-[40px] shadow-[0_0_90px_-10px_rgba(239,182,34,0.4)] flex relative overflow-hidden ring-1 ring-primary-gold/30 mx-auto">
                <div className="w-full lg:w-[45%] p-12 lg:p-16 flex flex-col justify-center relative z-10 bg-white">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        <div className="mb-4">
                            <Link to="/" className="inline-flex items-center gap-4 group">
                                <img src={goldRushBg} alt="Gold Rush" className="h-12 w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)] rounded-lg" />
                                <h1 className="text-2xl font-bold tracking-widest text-gray-900 group-hover:text-primary-gold transition-colors duration-300 uppercase font-outfit">
                                    GOLD RUSH
                                </h1>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight animate-fade-in-up">
                                {step === 1 ? t.signUpTitle : t.shopDetailsTitle}
                            </h2>
                            <p className="text-gray-500 font-medium text-lg animate-fade-in-up stagger-delay-1">
                                {step === 1 ? t.signUpSubtitle : t.shopDetailsSubtitle}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up stagger-delay-2" autoComplete="off">
                            {formError && (
                                <div className="rounded-2xl border border-red-200/70 bg-red-50/90 text-red-800 px-4 py-3 text-sm font-semibold shadow-sm shadow-red-900/10">
                                    {formError}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.fullNamePlaceholder}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Michal"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.fullName}
                                            onChange={handleChange('fullName')}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.phonePlaceholder}</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. 0170000000"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.phone}
                                            onChange={handleChange('phone')}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.emailPlaceholder}</label>
                                        <input
                                            type="text"
                                            placeholder="name@example.com"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.identifier}
                                            onChange={handleChange('identifier')}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.passwordPlaceholder}</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.password}
                                            onChange={handleChange('password')}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.confirmPasswordPlaceholder}</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.confirmPassword}
                                            onChange={handleChange('confirmPassword')}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.shopNamePlaceholder}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. City Gold House"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                            value={formData.shop_name}
                                            onChange={handleChange('shop_name')}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.branchCountPlaceholder}</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                min="1"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                                value={formData.branch_count}
                                                onChange={handleChange('branch_count')}
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{t.taxIdPlaceholder}</label>
                                            <input
                                                type="text"
                                                placeholder="BIN-1234"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300 uppercase tracking-wide"
                                                value={formData.tax_id}
                                                onChange={handleChange('tax_id')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-4">
                                {step === 2 && (
                                    <button type="button" onClick={handleBack} className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-2xl transition-all duration-300 border border-gray-200">
                                        {t.back}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={step === 1 && !isStep1Complete}
                                    className="flex-1 w-full bg-[#007AFF] hover:bg-[#0063D1] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                                    style={{ backgroundColor: '#EFB622', boxShadow: '0 4px 20px rgba(239, 182, 34, 0.25)' }}
                                >
                                    {step === 1 ? t.next : t.signUp}
                                </button>
                            </div>

                            <p className="text-center text-gray-500 font-medium text-sm">
                                {t.yesAccount}{' '}
                                <Link to="/signin" className="text-primary-gold hover:text-yellow-600 font-bold transition-colors ml-1 hover:underline underline-offset-4 decoration-primary-gold/50">
                                    {t.signInLink}
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className={`hidden lg:block w-[55%] relative overflow-hidden transition-all duration-700 ${step === 2 ? 'bg-gray-100' : 'bg-black'}`}>
                    <div className="absolute top-0 bottom-0 left-[-1px] w-24 z-20 pointer-events-none">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0 H100 V100 H0 V0 Z" fill="transparent" />
                            <path d="M0 0 C40 20 60 40 60 50 C60 60 40 80 0 100 V0 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="absolute inset-0 z-10">
                        {step === 2 ? (
                            <div className="w-full h-full relative">
                                <LocationPicker value={location} onLocationSelect={setLocation} />
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(239,182,34,0.18), transparent 32%), radial-gradient(circle at 20% 70%, rgba(239,182,34,0.12), transparent 28%), linear-gradient(135deg, rgba(8,8,10,0.95), rgba(12,12,14,0.9) 45%, rgba(8,8,10,0.92))' }}></div>
                                <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/75 to-black/50"></div>
                                <div className="absolute bottom-20 right-20 text-right space-y-4 max-w-lg p-8">
                                    <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-xl">
                                        Crafting <br /> <span className="text-primary-gold">Elegance.</span>
                                    </h2>
                                    <p className="text-gray-200 text-lg drop-shadow-lg font-medium">
                                        Manage your inventory, sales, and customers with a system as precious as your products.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
