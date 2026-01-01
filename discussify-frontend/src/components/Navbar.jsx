import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
    HiOutlineUser,
    HiOutlineCog,
    HiOutlineLogout,
    HiMenu,
    HiX
} from 'react-icons/hi';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    </svg>
                    <span>Discussify</span>
                </Link>

                {isAuthenticated ? (
                    <>
                        <div className="navbar-nav">
                            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                            <Link to="/explore" className="navbar-link">Explore</Link>
                            <Link to="/create-community" className="navbar-link">Create</Link>
                        </div>

                        <div className="navbar-actions">
                            <NotificationDropdown />

                            <div className="dropdown" ref={dropdownRef}>
                                <button
                                    className="avatar avatar-md cursor-pointer"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{ border: 'none' }}
                                >
                                    {user?.profileImage ? (
                                        <img src={user.profileImage.startsWith('http') ? user.profileImage : (user.profileImage.startsWith('uploads') ? `/${user.profileImage}` : `/uploads/${user.profileImage}`)} alt={user.username} />
                                    ) : (
                                        getInitials(user?.username)
                                    )}
                                </button>

                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--secondary-100)' }}>
                                            <p style={{ fontWeight: 600, marginBottom: '2px' }}>{user?.username}</p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 0 }}>{user?.email}</p>
                                        </div>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                            <HiOutlineUser size={18} />
                                            <span>Profile</span>
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <HiOutlineCog size={18} />
                                                <span>Admin Panel</span>
                                            </Link>
                                        )}
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <HiOutlineLogout size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="navbar-actions">
                        <Link to="/login" className="btn btn-ghost">Log In</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
