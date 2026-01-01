import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import {
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineUserGroup,
    HiOutlineDocumentText,
    HiOutlineArrowLeft
} from 'react-icons/hi';

const AdminLayout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <Navbar />
            <div className="layout-with-sidebar">
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <Link to="/dashboard" className="sidebar-link" style={{ marginBottom: 'var(--space-4)' }}>
                            <HiOutlineArrowLeft />
                            <span>Back to App</span>
                        </Link>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Admin Panel</h3>
                        <nav className="sidebar-nav">
                            <Link
                                to="/admin"
                                className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                            >
                                <HiOutlineChartBar />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/admin/users"
                                className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
                            >
                                <HiOutlineUsers />
                                <span>Users</span>
                            </Link>
                            <Link
                                to="/admin/communities"
                                className={`sidebar-link ${isActive('/admin/communities') ? 'active' : ''}`}
                            >
                                <HiOutlineUserGroup />
                                <span>Communities</span>
                            </Link>
                        </nav>
                    </div>
                </aside>
                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    );
};

export default AdminLayout;
