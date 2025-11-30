import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import Footer from './components/Footer';
import SignIn from './pages/Auth/SignIn';

function App() {
    return (
        <LanguageProvider>
            <div className="app">
                <Routes>
                    <Route path="/" element={
                        <>
                            <Header />
                            <main>
                                <LandingPage />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/signin" element={<SignIn />} />
                </Routes>
            </div>
        </LanguageProvider>
    );
}

export default App;
