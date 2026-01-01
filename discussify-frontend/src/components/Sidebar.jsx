import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineGlobe,
    HiOutlinePlus,
    HiOutlineUser,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineUserGroup
} from 'react-icons/hi';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">Menu</h3>
                <nav className="sidebar-nav">
                    <Link
                        to="/dashboard"
                        className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <HiOutlineHome />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/explore"
                        className={`sidebar-link ${isActive('/explore') ? 'active' : ''}`}
                    >
                        <HiOutlineGlobe />
                        <span>Explore</span>
                    </Link>
                    <Link
                        to="/create-community"
                        className={`sidebar-link ${isActive('/create-community') ? 'active' : ''}`}
                    >
                        <HiOutlinePlus />
                        <span>Create Community</span>
                    </Link>
                    <Link
                        to="/profile"
                        className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
                    >
                        <HiOutlineUser />
                        <span>Profile</span>
                    </Link>
                </nav>
            </div>

            {user?.role === 'admin' && (
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Admin</h3>
                    <nav className="sidebar-nav">
                        <Link
                            to="/admin"
                            className={`sidebar-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                        >
                            <HiOutlineCog />
                            <span>Admin Panel</span>
                        </Link>
                    </nav>
                </div>
            )}

            <div className="sidebar-section" style={{ marginTop: 'auto' }}>
                <nav className="sidebar-nav">
                    <button onClick={logout} className="sidebar-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <HiOutlineLogout />
                        <span>Logout</span>
                    </button>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
