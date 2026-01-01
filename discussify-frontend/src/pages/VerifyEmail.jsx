import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);
    const { verifyEmail, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const passedOtp = location.state?.otp;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) return;

        setLoading(true);
        const result = await verifyEmail(email, otpString);
        setLoading(false);

        if (result.success) {
            navigate('/login');
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        const result = await resendOTP(email);
        setResendLoading(false);

        if (result.success) {
            setCountdown(60);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        </svg>
                    </div>
                    <h1 className="auth-title">Verify Your Email</h1>
                    <p className="auth-subtitle">
                        We've sent a 6-digit code to<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="otp-container" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                className="otp-input"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                maxLength={1}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? (
                            <>
                                <span className="loader loader-sm" style={{ borderTopColor: 'white' }}></span>
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 'var(--space-2)' }}>
                        Didn't receive the code?
                    </p>
                    {countdown > 0 ? (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-400)' }}>
                            Resend in {countdown}s
                        </p>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="btn btn-ghost"
                            disabled={resendLoading}
                        >
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    )}
                </div>

                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
