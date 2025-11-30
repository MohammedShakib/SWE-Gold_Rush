import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const { language, toggleLanguage } = useLanguage();
    const t = translations[language].nav;
    const location = useLocation();
    const isHome = location.pathname === '/';

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

    // Function to handle smooth scroll for anchor links
    const handleNavClick = (e, href) => {
        if (!isHome) return; // Let Link handle navigation if not on home
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-[#0B0D10]/90 backdrop-blur-lg border-b border-white/5 shadow-lg shadow-black/20' : 'py-6 bg-transparent'
            }`}>
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-primary-gold">
                        GOLD RUSH
                    </Link>

                    <nav className="flex items-center gap-8">
                        <ul className="flex gap-8">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    {isHome ? (
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href)}
                                            className="text-text-light font-medium transition-colors hover:text-primary-gold"
                                        >
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link
                                            to={`/${link.href}`}
                                            className="text-text-light font-medium transition-colors hover:text-primary-gold"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="bg-transparent border border-primary-gold text-primary-gold px-4 py-2 rounded-full cursor-pointer font-semibold hover:bg-primary-gold hover:text-darker-bg transition-all"
                            >
                                {language === 'EN' ? '🇺🇸 EN' : '🇧🇩 BN'}
                            </button>

                            <Link
                                to="/signin"
                                className="bg-gradient-to-r from-primary-gold via-yellow-200 to-primary-gold text-darker-bg px-6 py-2 rounded-full font-bold shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/30 hover:-translate-y-0.5 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
