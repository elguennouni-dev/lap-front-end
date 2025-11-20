import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

const LoginScreen: React.FC = () => {
    const { login } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                            <Icon name="logo" className="h-8 w-8 text-white"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-slate-800">
                            Connexion à LAP
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Veuillez entrer vos identifiants pour continuer
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 tracking-wide">
                            Email
                        </label>
                        <div className="relative">
                           <div className="absolute top-1/2 -translate-y-1/2 left-4">
                             <Icon name="mail" className="w-5 h-5 text-slate-400"/>
                           </div>
                           <input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-base py-3 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-slate-400"
                            placeholder="mail@example.com"
                           />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700 tracking-wide">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-4">
                             <Icon name="key" className="w-5 h-5 text-slate-400"/>
                           </div>
                           <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-base py-3 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-slate-400"
                            placeholder="Entrez votre mot de passe"
                           />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <Icon name="error" className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="login" className="h-5 w-5" />
                                    <span>Se connecter</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;