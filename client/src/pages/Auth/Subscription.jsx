import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import goldRushBg from '../../assets/goldrush1.png';

const Subscription = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(location.state?.user || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            // If no user passed, redirect to signin
            navigate('/signin');
        }
    }, [user, navigate]);

    const plans = [
        {
            id: 'free',
            name: 'Free Trial',
            price: 'Free',
            period: '7 Days',
            description: 'Experience the full power of Gold Rush risk-free.',
            features: ['7 Days Full Access', 'All Features Included', 'No Credit Card Required', 'Instant Setup'],
            color: 'bg-gray-900'
        },
        {
            id: 'monthly',
            name: 'Monthly',
            price: '৳3,000',
            period: '/month',
            description: 'Flexible monthly billing for growing businesses.',
            features: ['Full Access Month-to-Month', 'All Features Included', 'Cancel Anytime', 'Priority Support'],
            color: 'bg-gray-900'
        },
        {
            id: 'yearly',
            name: 'Yearly',
            price: '৳30,000',
            period: '/year',
            description: 'Best value for established businesses.',
            features: ['Save 2 Months Price', 'All Features Included', 'Premium Support', 'Free Onboarding Session'],
            popular: true,
            color: 'bg-gray-900'
        },
        {
            id: 'lifetime',
            name: 'Lifetime',
            price: '৳1,00,000',
            period: 'one-time',
            description: 'One-time investment for a lifetime of value.',
            features: ['Lifetime Access', 'No Recurring Fees', 'All Features Included', 'Dedicated Account Manager'],
            color: 'bg-gray-900',
            glow: 'border-purple-500/50 shadow-purple-500/20'
        }
    ];

    const handlePlanSelect = async (plan) => {
        setLoading(true);
        try {
            if (!user?.id && !user?.user?.id) {
                alert('User info missing. Please sign in again.');
                navigate('/signin');
                return;
            }

            const response = await fetch('/api/subscription/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id || user.user?.id, // Handle nested user object if structure varies
                    plan: plan.id,
                    amount: plan.id === 'free' ? 0 : parseInt(plan.price.replace(/[^\d]/g, ''), 10)
                }),
            });

            const raw = await response.text();
            let data;
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (err) {
                console.error('Non-JSON response from subscription/update:', raw);
                data = {};
            }

            if (response.ok) {
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert('Subscription Successful!');
                    navigate('/signin'); // Or dashboard if auto-login
                }
            } else {
                const message = data.error || raw || 'Subscription Update Failed';
                alert(message);
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary-gold/30 selection:text-white">

            {/* Background Texture */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                {/* Simplified Bubbles for Background */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-gold/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl w-full relative z-10 animate-fade-in-up">
                <div className="text-center mb-12 space-y-4">
                    <img src={goldRushBg} alt="Gold Rush" className="h-16 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-gold to-white">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Unlock the full potential of Gold Rush. Start with a free trial or commit to success with our premium plans.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => !loading && handlePlanSelect(plan)}
                            className={`relative group cursor-pointer rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 border backdrop-blur-sm 
                                ${plan.popular ? 'border-primary-gold bg-[#1A1D23]/80 shadow-[0_0_30px_-5px_rgba(239,182,34,0.3)]' :
                                    plan.glow ? plan.glow + ' bg-[#1A1D23]/80 border-purple-500/50' :
                                        'border-white/10 bg-[#1A1D23]/50 hover:border-primary-gold/50 hover:bg-[#1A1D23]/80 hover:shadow-lg'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-gold text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.id !== 'free' ? 'text-white' : 'text-gray-200'}`}>{plan.name}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-sm text-gray-500 ml-2">{plan.period}</span>
                            </div>

                            <div className="space-y-4 mb-8 min-h-[160px]">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.id === 'free' ? 'text-gray-500' : 'text-primary-gold'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider
                                    ${plan.popular ? 'bg-primary-gold text-black hover:bg-yellow-500' :
                                        plan.id === 'lifetime' ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]' :
                                            'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {loading ? 'Processing...' : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button onClick={() => navigate('/signin')} className="text-gray-500 hover:text-white transition-colors text-sm font-medium">
                        Skip for now (Account Created)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
