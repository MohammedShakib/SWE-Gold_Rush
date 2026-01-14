import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import LocationPicker from '../../components/LocationPicker';

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
        signUpTitle: language === 'EN' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন',
        signUpSubtitle: language === 'EN' ? 'Join Gold Rush to manage your jewellery shop' : 'আপনার জুয়েলারী দোকান পরিচালনা করতে গোল্ড রাশ-এ যোগ দিন',
        fullNamePlaceholder: language === 'EN' ? 'Full Name' : 'পুরো নাম',
        phonePlaceholder: language === 'EN' ? 'Phone Number' : 'ফোন নম্বর',
        confirmPasswordPlaceholder: language === 'EN' ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন',
        forgotPassword: language === 'EN' ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?',
        noAccount: language === 'EN' ? "Don't have an account?" : 'কোন অ্যাকাউন্ট নেই?',
        yesAccount: language === 'EN' ? 'Already have an account?' : 'ইতোমধ্যে একটি অ্যাকাউন্ট আছে?',
        signUp: language === 'EN' ? 'Sign Up' : 'সাইন আপ করুন',
        signInLink: language === 'EN' ? 'Sign In' : 'সাইন ইন করুন'
    };

    const routeLocation = useLocation();
    const isSignUpRoute = routeLocation.pathname === '/signup';
    const [isSignUp, setIsSignUp] = useState(isSignUpRoute);

    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        fullName: '',
        phone: '',
        confirmPassword: ''
    });
    const [location, setLocation] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setIsSignUp(isSignUpRoute);
    }, [isSignUpRoute]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSignUp) {
            console.log('Sign Up attempt:', formData);

            if (formData.password !== formData.confirmPassword) {
                alert(language === 'EN' ? 'Passwords do not match!' : 'পাসওয়ার্ড মিলছে না!');
                return;
            }

            if (!location) {
                alert('Please select your shop location on the map.');
                return;
            }

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        latitude: location.lat,
                        longitude: location.lng
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(language === 'EN' ? 'Signup Successful!' : 'সাইন আপ সফল হয়েছে!');
                    setIsSignUp(false);
                    navigate('/signin');
                    // Clear form
                    setFormData({
                        identifier: '',
                        password: '',
                        fullName: '',
                        phone: '',
                        confirmPassword: ''
                    });
                    setLocation(null);
                } else {
                    alert(data.error || 'Signup Failed');
                }
            } catch (error) {
                console.error('Error during signup:', error);
                alert(language === 'EN' ? 'Something went wrong. Please try again.' : 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
            return;
        }

        if (formData.identifier === 'admin' && formData.password === 'admin') {
            localStorage.setItem('shopowner_auth', 'true');
            navigate('/shopowner/dashboard');
            return;
        }
        console.log('Sign in attempt:', formData);
    };

    const toggleMode = () => {
        const nextIsSignUp = !isSignUp;
        setIsSignUp(nextIsSignUp);
        setFormData({
            identifier: '',
            password: '',
            fullName: '',
            phone: '',
            confirmPassword: ''
        });
        setLocation(null);
        navigate(nextIsSignUp ? '/signup' : '/signin');
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    fullName: user.displayName,
                    photoURL: user.photoURL
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('shopowner_auth', 'true');
                navigate('/shopowner/dashboard');
            } else {
                alert(data.error || "Google Sign In Failed");
            }
        } catch (error) {
            console.error("Google Sign In Error", error);
            alert("Google Sign In Failed");
        }
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

            <div className={`w-full relative z-10 perspective-1000 px-4 transition-all duration-500 ${isSignUp ? 'max-w-5xl' : 'max-w-[420px]'}`}>
                <div className="text-center mb-10 animate-fade-in-down">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform duration-300">
                            GOLD RUSH
                        </h1>
                    </Link>
                </div>

                <div className={`bg-[#121418]/70 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl shadow-black/50 relative overflow-hidden group hover:border-primary-gold/20 transition-all duration-500 flex flex-col md:flex-row ${isSignUp ? 'max-w-5xl md:w-[900px]' : 'max-w-[420px]'} mx-auto`}>
                    {/* Card Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

                    {/* Left Side - Form */}
                    <div className={`w-full ${isSignUp ? 'md:w-1/2' : ''} p-6 md:p-10 relative z-10 transition-all duration-500`}>

                        <div className="text-center mb-8 md:mb-10 relative z-10 transition-all duration-500">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                                {isSignUp ? t.signUpTitle : t.title}
                            </h2>
                            <p className="text-gray-400 text-sm font-medium">
                                {isSignUp ? t.signUpSubtitle : t.subtitle}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 relative z-10">
                            {isSignUp && (
                                <>
                                    <div className="group/input animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                                        <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                            <input
                                                type="text"
                                                placeholder={t.fullNamePlaceholder}
                                                className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-gold/20 to-transparent opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm"></div>
                                        </div>
                                    </div>

                                    <div className="group/input animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                        <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                            <input
                                                type="tel"
                                                placeholder={t.phonePlaceholder}
                                                className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="group/input animate-fade-in-up" style={{ animationDelay: isSignUp ? '200ms' : '0ms' }}>
                                <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                    <input
                                        type="text"
                                        placeholder={t.emailPlaceholder}
                                        className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                        value={formData.identifier}
                                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-gold/20 to-transparent opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm"></div>
                                </div>
                            </div>

                            <div className="group/input animate-fade-in-up" style={{ animationDelay: isSignUp ? '300ms' : '100ms' }}>
                                <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                    <input
                                        type="password"
                                        placeholder={t.passwordPlaceholder}
                                        className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isSignUp && (
                                <div className="group/input animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                    <div className="relative transition-all duration-300 transform group-hover/input:scale-[1.01]">
                                        <input
                                            type="password"
                                            placeholder={t.confirmPasswordPlaceholder}
                                            className="w-full bg-[#0B0D10]/80 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-2 focus:ring-primary-gold/20 transition-all duration-300 shadow-inner"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {!isSignUp && (
                                <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                    <a href="#" className="text-sm text-gray-400 hover:text-primary-gold transition-colors duration-300 font-medium">
                                        {t.forgotPassword}
                                    </a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold text-[#0B0D10] font-bold py-3 md:py-4 rounded-2xl shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn animate-fade-in-up"
                                style={{ animationDelay: isSignUp ? '500ms' : '300ms' }}
                            >
                                <span className="relative z-10">{isSignUp ? t.signUp : t.signIn}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </form>

                        <div className="relative z-10 my-6 flex items-center gap-4">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Or continue with</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            type="button"
                            className="w-full relative z-10 bg-[#0B0D10]/50 border border-white/10 hover:border-white/20 text-white font-medium py-3 md:py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group/google hover:bg-white/5 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="group-hover/google:text-white transition-colors">Google</span>
                        </button>

                        <div className="mt-8 md:mt-10 text-center relative z-10">
                            <p className="text-gray-400 text-sm">
                                {isSignUp ? t.yesAccount : t.noAccount}{' '}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="text-primary-gold font-bold hover:text-yellow-200 transition-colors ml-1 inline-block hover:underline decoration-primary-gold/50 underline-offset-4"
                                >
                                    {isSignUp ? t.signInLink : t.signUp}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Map (Only visible in SignUp mode) */}
                    <div className={`${isSignUp ? 'md:w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-500 relative bg-[#0B0D10] border-l border-white/5`}>
                        {isSignUp && (
                            <div className="absolute inset-0 w-full h-full">
                                <LocationPicker value={location} onLocationSelect={setLocation} />

                                {/* Overlay Content on Map */}
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#050608] via-[#050608]/90 to-transparent pointer-events-none">
                                    <h3 className="text-xl font-bold text-white mb-2">Locate Your Shop</h3>
                                    <p className="text-gray-400 text-sm">Click the map to pin your shop location.</p>
                                    {location && (
                                        <div className="mt-3 text-xs text-gray-300 font-medium bg-black/50 inline-flex gap-4 px-3 py-2 rounded-full border border-white/10">
                                            <span>Lat: {location.lat.toFixed(6)}</span>
                                            <span>Lng: {location.lng.toFixed(6)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
