import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

const OtpScreen: React.FC = () => {
    const { verifyOtp, resendOtp, isAwaitingOtp } = useAppContext();

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [email, setEmail] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Get email from localStorage or session
        const storedEmail = localStorage.getItem('pendingEmail') || '';
        setEmail(storedEmail);
        inputRefs.current[0]?.focus();
        setError('');
        setOtp(Array(6).fill(''));
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendCooldown]);

    const handleInput = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        setError('');

        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKey = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const pasteOtp = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

        const arr = Array(6).fill('');
        text.split('').forEach((n, i) => arr[i] = n);

        setOtp(arr);

        const next = arr.indexOf('');
        inputRefs.current[next === -1 ? 5 : next]?.focus();
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
        const result = await verifyOtp(email, otpString);

        if (!result.success) {
            setError(result.message || "Code invalide - Utilisez 123456");
            setOtp(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        }

        setLoading(false);
    };

    const resend = async () => {
        if (resendCooldown > 0 || !email) return;

        setResendCooldown(30);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        setError('');

        await resendOtp(email);
    };

    const fillWith123456 = () => {
        setOtp(['1', '2', '3', '4', '5', '6']);
        inputRefs.current[5]?.focus();
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))
        : "votre email";

    // If not awaiting OTP, don't show this component
    if (!isAwaitingOtp) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                            <Icon name="lock" className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Vérification en deux étapes</h2>
                    <p className="text-slate-600 text-sm">Code envoyé à :</p>
                    <p className="text-slate-800 font-medium">{maskedEmail}</p>
                    <p className="text-sm text-blue-600 font-medium">Utilisez le code: <strong>123456</strong></p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={verify}>
                    <label className="text-sm font-medium text-slate-700 text-center block">
                        Code de vérification
                    </label>

                    <div className="flex justify-center space-x-3" onPaste={pasteOtp}>
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
                                className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-xl
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={fillWith123456}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center space-x-2 mx-auto"
                        >
                            <Icon name="auto-fill" className="h-4 w-4" />
                            <span>Remplir avec 123456</span>
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center justify-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl py-3">
                            <Icon name="error" className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || otp.includes('')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white
                        font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
                                <span>Vérification...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="verified" className="h-5 w-5" />
                                <span>Vérifier le code</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Resend */}
                <div className="text-center space-y-2">
                    {resendCooldown > 0 ? (
                        <p className="text-sm text-slate-600">
                            Vous pourrez renvoyer un code dans <b>{resendCooldown}s</b>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-600">Code non reçu ?</p>
                    )}

                    <button
                        onClick={resend}
                        disabled={resendCooldown > 0 || loading}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <Icon name="refresh" className="h-4 w-4" />
                        <span>Renvoyer le code</span>
                    </button>
                </div>

                <p className="text-center text-xs text-slate-500">
                    Le code expire dans 10 minutes
                </p>
            </div>
        </div>
    );
};

export default OtpScreen;