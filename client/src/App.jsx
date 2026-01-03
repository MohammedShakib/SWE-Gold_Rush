import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import Footer from './components/Footer';
import SignIn from './pages/Auth/SignIn';
// import ShopOwnerSignIn from './pages/shopowner/SignIn';
import DashboardLayout from './pages/shopowner/DashboardLayout';
import DashboardHome from './pages/shopowner/modules/DashboardHome';
import Inventory from './pages/shopowner/modules/Inventory';
import Sales from './pages/shopowner/modules/Sales';
import Installments from './pages/shopowner/modules/Installments';
import Manufacturing from './pages/shopowner/modules/Manufacturing';
import Repairs from './pages/shopowner/modules/Repairs';
import CRM from './pages/shopowner/modules/CRM';
import AdminControl from './pages/shopowner/modules/AdminControl';
import AIPrediction from './pages/shopowner/modules/AIPrediction';

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

                    {/* Shop Owner Routes */}
                    {/* <Route path="/shopowner/login" element={<ShopOwnerSignIn />} /> - DEPRECATED */}
                    <Route path="/shopowner" element={<DashboardLayout />}>
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="installments" element={<Installments />} />
                        <Route path="manufacturing" element={<Manufacturing />} />
                        <Route path="repairs" element={<Repairs />} />
                        <Route path="crm" element={<CRM />} />
                        <Route path="admin" element={<AdminControl />} />
                        <Route path="ai-prediction" element={<AIPrediction />} />
                    </Route>
                </Routes>
            </div>
        </LanguageProvider>
    );
}

export default App;
