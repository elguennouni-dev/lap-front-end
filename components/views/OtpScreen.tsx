import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

const OtpScreen: React.FC = () => {
  const { verifyOtp, resendOtp, isAwaitingOtp } = useAppContext();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // In a real flow, email/username should be passed via context or props
    // We assume 'pendingEmail' is stored in localStorage by LoginScreen before transition
    const storedEmail = localStorage.getItem('pendingEmail') || '';
    setEmail(storedEmail);
    
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    setError('');
    setOtp(Array(6).fill(''));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const pasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (!text) return;

    const arr = Array(6).fill('');
    text.split('').forEach((n, i) => arr[i] = n);
    setOtp(arr);

    const nextEmptyIndex = arr.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError("Veuillez entrer les 6 chiffres");
      return;
    }

    if (!email) {
      setError("Erreur: email non disponible. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    
    // Call Context's verifyOtp which likely wraps api.verifyOtp
    const result = await verifyOtp(email, otpString);

    if (!result.success) {
      setError(result.message || "Code invalide");
    }
    // If success, Context handles redirect/state update
    setLoading(false);
  };

  const resend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendCooldown(30);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();
    setError('');

    // Context resend logic
    await resendOtp(email);
  };

  const fillWithDemoCode = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    inputRefs.current[5]?.focus();
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))
    : "votre email";

  // If not awaiting OTP, this component might not be rendered by parent routing, 
  // but good to have a check if using conditional rendering inside a layout.
  if (!isAwaitingOtp) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-3xl"></div>
        </div>

        <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 z-10 relative">
            
            <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                        <Icon name="lock" className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Vérification requise</h2>
                <p className="text-slate-500 text-sm mb-1">Un code a été envoyé à</p>
                <p className="text-slate-800 font-semibold">{maskedEmail}</p>
            </div>

            <form onSubmit={verify} className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between gap-2" onPaste={pasteOtp}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => inputRefs.current[i] = el}
                                type="text"
                                value={digit}
                                maxLength={1}
                                inputMode="numeric"
                                onChange={(e) => handleInput(i, e.target.value)}
                                onKeyDown={(e) => handleKey(i, e)}
                                disabled={loading}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-slate-50 transition-all duration-200 outline-none
                                    ${digit ? 'border-blue-500 text-slate-800 bg-white shadow-sm' : 'border-slate-200 text-slate-400'}
                                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:scale-105
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                        ))}
                    </div>

                    {/* Demo/Dev Helper - Remove in Production */}
                    {/* <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={fillWithDemoCode}
                            className="text-xs text-blue-600/70 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            <Icon name="auto-fill" className="h-3 w-3" />
                            <span>Demo: 123456</span>
                        </button>
                    </div> */}
                </div>

                {error && (
                    <div className="flex items-center justify-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl py-3 animate-shake">
                        <Icon name="error" className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                            <span>Vérification...</span>
                        </>
                    ) : (
                        <>
                            <span>Vérifier le code</span>
                            <Icon name="check" className="h-5 w-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">
                    Vous n'avez pas reçu le code ?
                </p>
                
                {resendCooldown > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-slate-400 bg-slate-50 py-2 px-4 rounded-lg w-fit mx-auto">
                        <Icon name="time" className="h-4 w-4" />
                        <span className="text-sm font-medium">Renvoyer dans {resendCooldown}s</span>
                    </div>
                ) : (
                    <button
                        onClick={resend}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm inline-flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Icon name="refresh" className="h-4 w-4" />
                        <span>Renvoyer le code</span>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default OtpScreen;