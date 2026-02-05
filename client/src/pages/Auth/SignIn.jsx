import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import goldRushBg from '../../assets/goldrush1.png';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';

const authTranslations = {
    EN: {
        title: 'Welcome Back!',
        subtitle: 'Sign in to access your shop dashboard.',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        signIn: 'Sign In',
        forgotPassword: 'Forgot Password?',
        noAccount: 'New to Gold Rush?',
        signUp: 'Create Account',
        signInLink: 'Sign In',
        googleBtn: 'Google',
        tagline: 'Manage your Jewellery Shop with Confidence.'
    }
};
authTranslations.BN = authTranslations.EN;

const SignIn = () => {
    const { language } = useLanguage();
    const t = authTranslations[language] || authTranslations.EN;
    const adminConfig = {
        user: import.meta.env.VITE_ADMIN_USER,
        password: import.meta.env.VITE_ADMIN_PASSWORD,
        userId: import.meta.env.VITE_ADMIN_USER_ID,
        shopownerId: import.meta.env.VITE_ADMIN_SHOPOWNER_ID
    };

    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    const navigate = useNavigate();
    const handleChange = (key) => (e) => {
        setFormError('');
        const raw = e.target.value;
        setFormData((prev) => ({ ...prev, [key]: raw }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (
            adminConfig.user
            && adminConfig.password
            && adminConfig.userId
            && adminConfig.shopownerId
            && formData.identifier === adminConfig.user
            && formData.password === adminConfig.password
        ) {
            localStorage.setItem('shopowner_auth', 'true');
            localStorage.setItem('userId', adminConfig.userId);
            localStorage.setItem('shopownerId', adminConfig.shopownerId);
            navigate('/shopowner/dashboard');
            return;
        }

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: formData.identifier, password: formData.password })
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (jsonError) {
                console.error("Failed to parse JSON:", text);
                throw new Error(text.substring(0, 50) || "Server Error (Non-JSON response)");
            }

            if (response.ok) {
                if (result.user.role === 'superadmin') {
                    navigate('/superadmin');
                } else {
                    localStorage.setItem('shopowner_auth', 'true');
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('shopownerId', result.user.shopowner_id);
                    navigate('/shopowner/dashboard');
                }
            } else {
                setFormError(result.error || "Login failed");
            }
        } catch (e) {
            console.error(e);
            setFormError(e.message || "Login Error");
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
            for (let i = 0; i < 20; i++) { // Increased count
                newBubbles.push({
                    id: i,
                    size: Math.random() * 60 + 20, // 20px - 80px
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    speedX: (Math.random() - 0.5) * 0.2, // Drift speed
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

                // Add gentle drift
                x += speedX;
                y += speedY;

                // Mouse repulsion
                const dx = (x / 100 * window.innerWidth) - mouseRef.current.x;
                const dy = (y / 100 * window.innerHeight) - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) { // Repulsion range
                    const force = (200 - distance) / 200;
                    x += (dx / distance) * force * 0.5;
                    y += (dy / distance) * force * 0.5;
                }

                // Wrap around edges
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

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, fullName: user.displayName, photoURL: user.photoURL })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('shopowner_auth', 'true');
                localStorage.setItem('userId', data.user.id); // Store actual user ID
                navigate('/shopowner/dashboard');
            } else {
                alert("Google Sign In Failed");
            }
        } catch (error) {
            console.error("Google Sign In Error", error);
            alert("Google Sign In Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary-gold/30 selection:text-white">
            {/* Mouse Follow Spotlight for Body */}
            <div
                className="absolute pointer-events-none z-0 transition-opacity duration-500 hidden lg:block"
                style={{
                    background: `radial-gradient(1200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 182, 34, 0.05), transparent 40%)`,
                    inset: 0
                }}
            ></div>

            {/* Background Texture & Animations (Gold Bubbles) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

                {/* Floating Gold Bubbles */}
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

            {/* Main Floating Card */}
            <div className="w-full max-w-[1280px] h-[760px] bg-[#F3F4F6] rounded-[40px] shadow-[0_0_90px_-10px_rgba(239,182,34,0.4)] flex relative overflow-hidden ring-1 ring-primary-gold/30 mx-auto">

                {/* Left Side: Form Section */}
                <div className="w-full lg:w-[45%] p-10 lg:p-14 flex flex-col justify-center relative z-10 bg-[#F3F4F6]">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        {/* Logo */}
                        <div className="mb-4">
                            <Link to="/" className="inline-flex items-center gap-4 group">
                                <img
                                    src={goldRushBg}
                                    alt="Gold Rush"
                                    className="h-12 w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)] rounded-lg"
                                />
                                <h1 className="text-2xl font-bold tracking-widest text-gray-900 group-hover:text-primary-gold transition-colors duration-300 uppercase font-outfit">
                                    GOLD RUSH
                                </h1>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight animate-fade-in-up">
                                {t.title}
                            </h2>
                            <p className="text-gray-500 font-medium text-lg animate-fade-in-up stagger-delay-1">
                                {t.subtitle}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up stagger-delay-2" autoComplete="off">
                            {formError && (
                                <div className="rounded-2xl border border-red-200/70 bg-red-50/90 text-red-800 px-4 py-3 text-sm font-semibold shadow-sm shadow-red-900/10">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-5">
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
                                    <div className="flex justify-between items-center ml-1 mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">{t.passwordPlaceholder}</label>
                                        <a href="#" className="text-xs font-bold text-primary-gold hover:text-yellow-600 transition-colors">{t.forgotPassword}</a>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-gold/50 focus:bg-white focus:ring-4 focus:ring-primary-gold/5 transition-all font-medium text-base hover:border-gray-300"
                                        value={formData.password}
                                        onChange={handleChange('password')}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 w-full bg-[#007AFF] hover:bg-[#0063D1] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                                    style={{ backgroundColor: '#EFB622', boxShadow: '0 4px 20px rgba(239, 182, 34, 0.25)' }}
                                >
                                    {t.signIn}
                                </button>
                            </div>

                            {/* Social Auth */}
                            <div className="space-y-6 pt-2">
                                <div className="relative flex items-center gap-4 opacity-50">
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Or</span>
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                </div>
                                <button
                                    onClick={handleGoogleSignIn}
                                    type="button"
                                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <p className="text-center text-gray-500 font-medium text-sm">
                                {t.noAccount}{' '}
                                <Link to="/signup" className="text-primary-gold hover:text-yellow-600 font-bold transition-colors ml-1 hover:underline underline-offset-4 decoration-primary-gold/50">
                                    {t.signUp}
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                {/* Right Side: Visual / Map Area */}
                <div className={`hidden lg:block w-[55%] relative overflow-hidden transition-all duration-700 bg-black`}>

                    {/* Curved Divider Overlay */}
                    <div className="absolute top-0 bottom-0 left-[-1px] w-24 z-20 pointer-events-none">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0 H100 V100 H0 V0 Z" fill="transparent" />
                            <path d="M0 0 C40 20 60 40 60 50 C60 60 40 80 0 100 V0 Z" fill="#F3F4F6" />
                        </svg>
                    </div>

                    {/* Content Layer */}
                    <div className="absolute inset-0 z-10">
                        <div className="w-full h-full relative">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'radial-gradient(circle at 70% 30%, rgba(239,182,34,0.18), transparent 32%), radial-gradient(circle at 20% 70%, rgba(239,182,34,0.12), transparent 28%), linear-gradient(135deg, rgba(8,8,10,0.95), rgba(12,12,14,0.9) 45%, rgba(8,8,10,0.92))'
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/75 to-black/50"></div>

                            {/* Text Content */}
                            <div className="absolute bottom-20 right-20 text-right space-y-4 max-w-lg p-8">
                                <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-xl">
                                    Crafting <br />
                                    <span className="text-primary-gold">Elegance.</span>
                                </h2>
                                <p className="text-gray-200 text-lg drop-shadow-lg font-medium">
                                    Manage your inventory, sales, and customers with a system as precious as your products.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
