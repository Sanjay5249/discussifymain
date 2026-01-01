import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail } from 'react-icons/hi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);

        if (result.success) {
            navigate('/reset-password', { state: { email, otp: result.otp } });
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
                    <h1 className="auth-title">Forgot Password?</h1>
                    <p className="auth-subtitle">
                        Enter your email and we'll send you a reset code
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="form-input-icon">
                            <HiOutlineMail className="icon" size={20} />
                            <input
                                type="email"
                                className={`form-input ${error ? 'error' : ''}`}
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        {error && <p className="form-error">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loader loader-sm" style={{ borderTopColor: 'white' }}></span>
                                Sending...
                            </>
                        ) : (
                            'Send Reset Code'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
