import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlinePhotograph,
    HiOutlineX,
    HiOutlineEye,
    HiOutlineEyeOff
} from 'react-icons/hi';

const INTERESTS = [
    'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
];

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        interests: [],
        profileImage: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profileImage: 'Image size must be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, profileImage: file }));
            setPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, profileImage: '' }));
        }
    };

    const removeProfileImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFormData(prev => ({ ...prev, profileImage: null }));
        setPreview(null);
    };

    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else {
            // Comprehensive email validation regex
            const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            } else if (formData.email.length > 254) {
                newErrors.email = 'Email address is too long';
            } else if (formData.email.split('@')[0].length > 64) {
                newErrors.email = 'Email local part is too long';
            } else if (/\.{2,}/.test(formData.email)) {
                newErrors.email = 'Email cannot contain consecutive dots';
            }
        }

        // Enhanced password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordErrors = [];
            if (formData.password.length < 8) {
                passwordErrors.push('at least 8 characters');
            }
            if (!/[A-Z]/.test(formData.password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(formData.password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!/[0-9]/.test(formData.password)) {
                passwordErrors.push('one number');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
                passwordErrors.push('one special character (!@#$%^&*...)');
            }
            if (passwordErrors.length > 0) {
                newErrors.password = 'Password must contain: ' + passwordErrors.join(', ');
            }
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        formData.interests.forEach(interest => {
            data.append('interests', interest);
        });
        if (formData.profileImage) {
            data.append('profileImage', formData.profileImage);
        }

        const result = await register(data);
        setLoading(false);

        if (result.success) {
            navigate('/verify-email', { state: { email: formData.email, otp: result.otp } });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card" style={{ maxWidth: step === 2 ? '520px' : '420px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        </svg>
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">
                        {step === 1 ? 'Enter your details to get started' : 'Select your interests'}
                    </p>
                </div>

                {/* Progress */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: 'var(--primary-600)'
                    }}></div>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: step === 2 ? 'var(--primary-600)' : 'var(--secondary-200)'
                    }}></div>
                </div>

                {step === 1 ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                        <div className="form-group">
                            <div className="form-input-icon">
                                <HiOutlineUser className="icon" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    className={`form-input ${errors.username ? 'error' : ''}`}
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.username && <p className="form-error">{errors.username}</p>}
                        </div>

                        <div className="form-group">
                            <div className="form-input-icon">
                                <HiOutlineMail className="icon" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <div className="form-input-icon">
                                <HiOutlineLockClosed className="icon" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
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
                                    name="confirmPassword"
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm Password"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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

                        <button type="submit" className="btn btn-primary w-full">
                            Continue →
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Profile Image */}
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label className="form-label">Profile Picture (Optional)</label>
                            <div className="file-upload" style={{ maxWidth: '200px', margin: '0 auto', padding: 'var(--space-4)' }}>
                                {preview ? (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                margin: '0 auto'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeProfileImage}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '50px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--error)',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'var(--shadow-sm)',
                                                zIndex: 10
                                            }}
                                            title="Remove photo"
                                        >
                                            <HiOutlineX size={14} />
                                        </button>
                                        <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)', marginBottom: 0 }}>
                                            Click to change
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <HiOutlinePhotograph className="file-upload-icon" />
                                        <p className="file-upload-text" style={{ marginBottom: 0 }}>
                                            <strong>Upload</strong> photo
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {errors.profileImage && <p className="form-error">{errors.profileImage}</p>}
                        </div>

                        {/* Interests */}
                        <div className="form-group">
                            <label className="form-label">Select your interests</label>
                            <div className="interests-grid">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                                        onClick={() => toggleInterest(interest)}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setStep(1)}
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loader loader-sm" style={{ borderTopColor: 'white' }}></span>
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
