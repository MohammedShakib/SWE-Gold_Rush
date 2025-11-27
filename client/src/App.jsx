import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
    return (
        <LanguageProvider>
            <div className="app">
                <Header />
                <main>
                    <HeroSection />
                    <AboutSection />
                    <FeaturesSection />
                    <BlogSection />
                    <ContactSection />
                </main>
                <Footer />
            </div>
        </LanguageProvider>
    );
}

export default App;
