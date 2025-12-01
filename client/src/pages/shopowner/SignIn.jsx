import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShopOwnerSignIn = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (credentials.username === 'admin' && credentials.password === 'admin') {
            // In a real app, we would set a token here.
            // For now, we'll just navigate to the dashboard.
            localStorage.setItem('shopowner_auth', 'true');
            navigate('/shopowner/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center p-4">
            <div className="bg-[#121418] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Shop Owner Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-gold"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="w-full bg-[#0B0D10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-gold"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-gold text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShopOwnerSignIn;
