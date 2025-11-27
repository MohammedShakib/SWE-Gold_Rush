import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

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

                    <div className="animate-fade-in delay-200 relative">
                        {/* Abstract visual representation */}
                        <div className="animate-float bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-2xl border border-glass-border rounded-3xl p-8 shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="flex justify-between mb-8 border-b border-glass-border pb-4">
                                <div className="w-10 h-10 bg-primary-gold rounded-full"></div>
                                <div className="w-30 h-2.5 bg-white/10 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-20 bg-white/[0.03] rounded-xl"></div>
                                ))}
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-5 -right-5 bg-card-bg px-4 py-3 rounded-xl border border-primary-gold text-primary-gold font-bold shadow-lg shadow-black/50">
                            {t.support}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
