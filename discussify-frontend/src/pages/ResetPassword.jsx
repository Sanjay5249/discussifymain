import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const ResetPassword = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const inputRefs = useRef([]);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const passedOtp = location.state?.otp;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const validate = () => {
        const newErrors = {};
        if (otp.join('').length !== 6) {
            newErrors.otp = 'Please enter the 6-digit code';
        }

        // Enhanced password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordErrors = [];
            if (password.length < 8) {
                passwordErrors.push('at least 8 characters');
            }
            if (!/[A-Z]/.test(password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                passwordErrors.push('one number');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                passwordErrors.push('one special character (!@#$%^&*...)');
            }
            if (passwordErrors.length > 0) {
                newErrors.password = 'Password must contain: ' + passwordErrors.join(', ');
            }
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await resetPassword(email, otp.join(''), password);
        setLoading(false);

        if (result.success) {
            navigate('/login');
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
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">
                        Enter the code sent to<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Verification Code</label>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength={1}
                                    style={{ width: '45px', height: '50px' }}
                                />
                            ))}
                        </div>
                        {errors.otp && <p className="form-error" style={{ textAlign: 'center' }}>{errors.otp}</p>}
                    </div>

                    <div className="form-group">
                        <div className="form-input-icon">
                            <HiOutlineLockClosed className="icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder="New Password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors(prev => ({ ...prev, password: '' }));
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--secondary-400)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <div className="form-input-icon">
                            <HiOutlineLockClosed className="icon" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--secondary-400)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showConfirmPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loader loader-sm" style={{ borderTopColor: 'white' }}></span>
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
