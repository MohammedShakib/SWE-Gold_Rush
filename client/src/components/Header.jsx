import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const { language, toggleLanguage } = useLanguage();
    const t = translations[language].nav;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t.about, href: '#about' },
        { name: t.features, href: '#features' },
        { name: t.demo, href: '#contact' },
        { name: t.blog, href: '#blog' },
        { name: t.contact, href: '#contact' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-[#0B0D10]/90 backdrop-blur-lg border-b border-white/5 shadow-lg shadow-black/20' : 'py-6 bg-transparent'
            }`}>
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-primary-gold">
                        GOLD RUSH
                    </div>

                    <nav className="flex items-center gap-8">
                        <ul className="flex gap-8">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-text-light font-medium transition-colors hover:text-primary-gold"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={toggleLanguage}
                            className="bg-transparent border border-primary-gold text-primary-gold px-4 py-2 rounded-full cursor-pointer font-semibold hover:bg-primary-gold hover:text-darker-bg transition-all"
                        >
                            {language === 'EN' ? '🇺🇸 EN' : '🇧🇩 BN'}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
