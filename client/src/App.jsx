import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import Footer from './components/Footer';

function App() {
    return (
        <LanguageProvider>
            <div className="app">
                <Header />
                <main>
                    <LandingPage />
                </main>
                <Footer />
            </div>
        </LanguageProvider>
    );
}

export default App;
