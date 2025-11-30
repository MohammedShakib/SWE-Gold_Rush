import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const FeaturesSection = () => {
    const { language } = useLanguage();
    const t = translations[language].features;
    useScrollAnimation();

    const icons = [
        { emoji: "⚖️", bg: "bg-yellow-500/10" },
        { emoji: "🏢", bg: "bg-blue-500/10" },
        { emoji: "💻", bg: "bg-green-500/10" },
        { emoji: "👥", bg: "bg-purple-500/10" },
        { emoji: "📒", bg: "bg-orange-500/10" },
        { emoji: "🔒", bg: "bg-red-500/10" },
        { emoji: "🔨", bg: "bg-gray-500/10" },
        { emoji: "📦", bg: "bg-indigo-500/10" },
        { emoji: "👔", bg: "bg-pink-500/10" },
        { emoji: "📊", bg: "bg-cyan-500/10" },
        { emoji: "📱", bg: "bg-teal-500/10" },
        { emoji: "💰", bg: "bg-yellow-600/10" }
    ];

    return (
        <section id="features" className="py-24">
            <div className="container mx-auto px-8">
                <h2 className="section-title reveal">{t.title}</h2>
                <p className="section-subtitle reveal">{t.subtitle}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {t.list.map((feature, index) => (
                        <div
                            key={index}
                            className="glass-card reveal text-center group hover:scale-105"
                            style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
                        >
                            <div className={`w-16 h-16 mx-auto mb-4 ${icons[index].bg} rounded-2xl flex items-center justify-center text-4xl`}>
                                {icons[index].emoji}
                            </div>
                            <h3 className="mb-2 text-text-light font-semibold text-lg">{feature.title}</h3>
                            <p className="text-text-dim text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
