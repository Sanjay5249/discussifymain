import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CommunityManagement from './pages/admin/CommunityManagement';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loader loader-lg"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loader loader-lg"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loader loader-lg"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/explore" element={
                <ProtectedRoute>
                    <Layout>
                        <Explore />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/community/:idOrSlug" element={
                <ProtectedRoute>
                    <Layout>
                        <Community />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/create-community" element={
                <ProtectedRoute>
                    <Layout>
                        <CreateCommunity />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <Layout>
                        <Profile />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Layout>
                        <Notifications />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <AdminRoute>
                    <AdminLayout>
                        <AdminDashboard />
                    </AdminLayout>
                </AdminRoute>
            } />
            <Route path="/admin/users" element={
                <AdminRoute>
                    <AdminLayout>
                        <UserManagement />
                    </AdminLayout>
                </AdminRoute>
            } />
            <Route path="/admin/communities" element={
                <AdminRoute>
                    <AdminLayout>
                        <CommunityManagement />
                    </AdminLayout>
                </AdminRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
