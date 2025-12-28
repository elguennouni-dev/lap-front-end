import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

const LoginScreen: React.FC = () => {
  const { login, verifyOtp } = useAppContext(); // Use context functions directly
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');

  // Load pending email if page was refreshed during OTP step
  useEffect(() => {
    const pending = localStorage.getItem('pendingEmail');
    if (pending) {
        setEmail(pending);
        setStep('OTP');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Call Context Login (handles initial auth & check)
      const result = await login(email, password);
      
      if (result.success) {
        // Look at the internal logic of Context login:
        // If it set "isAwaitingOtp" to true, we switch UI to OTP
        // Note: We need to check the api response directly to know if we should switch UI immediately
        // OR rely on the context state change.
        
        // Safer way: Check API directly here for UI transition decision
        const apiCheck = await api.login(email, password); 
        // (Double call isn't ideal but safest without refactoring Context return types deeply)
        // Better approach: Trust the Context to handle state, we just update local UI step.
        
        if (apiCheck.otpRequired) {
            setStep('OTP');
        } 
        // If not OTP required, Context.login already set currentUser, so MainLayout will render automatically.
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 2. Call Context Verify (Updates currentUser and isAwaitingOtp)
      const result = await verifyOtp(email, otp);

      if (result.success) {
        // SUCCESS! 
        // Do NOT reload the page.
        // The AppContext has updated 'currentUser', so the main App component
        // will automatically switch from LoginScreen to the Dashboard/Sidebar layout.
      } else {
        setError(result.message || "Code invalide");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'OTP Invalide');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
      setStep('LOGIN');
      localStorage.removeItem('pendingEmail');
      setOtp('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl"></div>
         <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-10 relative">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Icon name="logo" className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {step === 'OTP' ? 'Vérification' : 'Bienvenue'}
            </h2>
            <p className="text-slate-500 text-base">
              {step === 'OTP' ? 'Un code a été envoyé à votre email' : 'Connectez-vous à votre espace de travail'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        {step === 'LOGIN' && (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email ou Identifiant</label>
                <div className="relative group">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Icon name="person" className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-base py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="Identifiant ou Email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Icon name="lock" className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-base py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl animate-shake">
                <Icon name="error" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <Icon name="chevron-right" className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* OTP Form */}
        {step === 'OTP' && (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-sm font-semibold text-slate-700 ml-1">Code de Vérification</label>
              <div className="relative group">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  <Icon name="lock" className="w-5 h-5" />
                </div>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-base py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all duration-200 tracking-widest font-mono text-center text-xl"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl animate-shake">
                <Icon name="error" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col space-y-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <span>Valider le Code</span>
                    <Icon name="check" className="h-5 w-5" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        )}
        
        {/* Footer */}
        <div className="text-center pt-4">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} LAP Signalétique. Tous droits réservés.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;