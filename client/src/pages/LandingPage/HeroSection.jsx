import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

import CountUp from '../../components/CountUp';

const HeroSection = () => {
    const { language } = useLanguage();
    const t = translations[language].hero;

    return (
        <section className="min-h-screen flex items-center pt-20 relative bg-gradient-radial from-primary-gold/10 to-transparent">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in">
                        <h1 className="text-5xl lg:text-6xl leading-tight mb-6 font-bold">
                            {language === 'EN' ? (
                                <>
                                    Best <span className="bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold bg-clip-text text-transparent">Jewellery Management</span> Software in Bangladesh
                                </>
                            ) : (
                                <span className="bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold bg-clip-text text-transparent">{t.title}</span>
                            )}
                        </h1>

                        <p className="text-xl text-text-dim mb-10 max-w-2xl">
                            {t.subtitle}
                        </p>

                        <div className="flex gap-4">
                            <a href="#contact" className="btn btn-primary">{t.getStarted}</a>
                            <a href="#features" className="btn btn-outline">{t.viewFeatures}</a>
                        </div>
                    </div>

                    <div className="animate-fade-in delay-200 relative perspective-1000">
                        {/* Dashboard Card */}
                        <div className="bg-[#0F1115] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-primary-gold rounded-full shadow-lg shadow-primary-gold/20 relative z-10"></div>
                                    <div className="absolute inset-0 bg-primary-gold/50 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute -inset-2 bg-primary-gold/20 rounded-full blur-xl"></div>
                                </div>
                                <div className="px-6 py-3 rounded-2xl border border-primary-gold bg-[#1A1D21] shadow-lg shadow-black/50 animate-float">
                                    <span className="text-primary-gold font-bold">24/7 Support</span>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-white/5 w-full mb-8"></div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Gold Rate */}
                                <div className="bg-[#1A1D21] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-gold/5 group">
                                    <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">🥇</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Gold Rate</div>
                                    <div className="text-2xl font-bold text-white">
                                        <CountUp end={98500} prefix="৳ " />
                                    </div>
                                </div>

                                {/* Silver Rate */}
                                <div className="bg-[#1A1D21] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-gold/5 group">
                                    <div className="w-10 h-10 bg-gray-400/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">🥈</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Silver Rate</div>
                                    <div className="text-2xl font-bold text-white">
                                        <CountUp end={1700} prefix="৳ " />
                                    </div>
                                </div>

                                {/* Today's Sales */}
                                <div className="bg-[#1A1D21] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-gold/5 group">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">📈</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Today's Sales</div>
                                    <div className="text-2xl font-bold text-white">
                                        <CountUp end={1.2} prefix="৳ " suffix="M" />
                                    </div>
                                </div>

                                {/* Total Customers */}
                                <div className="bg-[#1A1D21] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-gold/5 group">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">👥</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Total Customers</div>
                                    <div className="text-2xl font-bold text-white">
                                        <CountUp end={1250} suffix="+" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-gold/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
