import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const AboutSection = () => {
    const { language } = useLanguage();
    const t = translations[language].about;
    useScrollAnimation();

    return (
        <section id="about" className="py-24 bg-darker-bg">
            <div className="container mx-auto px-8">
                <h2 className="section-title reveal">{t.title}</h2>
                <p className="section-subtitle reveal">{t.subtitle}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="glass-card reveal">
                        <h3 className="text-2xl mb-4 text-primary-gold">{t.company}</h3>
                        <p className="mb-6 text-text-dim">
                            {t.desc}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            {['WIBSAS', 'DENTAON', 'Pharma Hisab', 'eRestora'].map(app => (
                                <span
                                    key={app}
                                    className="px-4 py-2 bg-white/5 rounded-full text-sm border border-glass-border"
                                >
                                    {app}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="reveal stagger-delay-1">
                        <div className="mb-12">
                            <h3 className="text-3xl mb-4 flex items-center gap-4">
                                <span className="text-4xl">🎯</span>
                                <span dangerouslySetInnerHTML={{ __html: t.missionTitle.replace('🎯 ', '') }} />
                            </h3>
                            <p className="text-text-dim text-lg">
                                {t.missionDesc}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl mb-4 flex items-center gap-4">
                                <span className="text-4xl">💎</span>
                                <span dangerouslySetInnerHTML={{ __html: t.whyTitle.replace('💎 ', '') }} />
                            </h3>
                            <ul className="grid gap-4">
                                {t.whyPoints.map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <span className="text-primary-gold text-xl">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
