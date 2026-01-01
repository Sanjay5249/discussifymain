import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // No token - immediately set loading to false without API call
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            if (response.data.success) {
                setUser(response.data.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                setIsAuthenticated(true);
                toast.success('Welcome back!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (formData) => {
        try {
            const response = await authAPI.register(formData);
            if (response.data.success) {
                console.log('Registration OTP:', response.data.user?.otp);
                toast.success('Registration successful! Please verify your email.');
                return { success: true, email: formData.get('email') };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const response = await authAPI.verifyEmail({ email, otp });
            if (response.data.success) {
                // Don't auto-login after verification - user should login manually
                toast.success('Email verified successfully! Please login.');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Verification failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const resendOTP = async (email) => {
        try {
            const response = await authAPI.resendOTP({ email });
            if (response.data.success) {
                toast.success('OTP sent to your email!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend OTP';
            toast.error(message);
            return { success: false, message };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await authAPI.forgotPassword({ email });
            if (response.data.success) {
                console.log('Reset OTP:', response.data.otp);
                toast.success('Password reset code sent!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send reset email';
            toast.error(message);
            return { success: false, message };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await authAPI.resetPassword({ email, otp, newPassword });
            if (response.data.success) {
                toast.success('Password reset successfully!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const updateProfile = async (formData) => {
        try {
            const response = await authAPI.updateProfile(formData);
            if (response.data.success) {
                // Backend returns user data in 'user' or 'data' field
                const userData = response.data.user || response.data.data;
                setUser(userData);
                toast.success('Profile updated successfully!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        verifyEmail,
        resendOTP,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
