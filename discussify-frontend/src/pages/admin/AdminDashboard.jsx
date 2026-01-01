import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
    HiOutlineUsers,
    HiOutlineUserGroup,
    HiOutlineDocumentText,
    HiOutlineTrendingUp
} from 'react-icons/hi';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const analyticsRes = await adminAPI.getAnalytics();

            if (analyticsRes.data.success) {
                setAnalytics(analyticsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Monitor and manage your platform</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Users</span>
                        <div className="stat-card-icon">
                            <HiOutlineUsers size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{analytics?.totalUsers || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Communities</span>
                        <div className="stat-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                            <HiOutlineUserGroup size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{analytics?.totalCommunities || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Posts</span>
                        <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                            <HiOutlineDocumentText size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{analytics?.totalPosts || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Engagement</span>
                        <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#047857' }}>
                            <HiOutlineTrendingUp size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{analytics?.engagementRate || '0'}%</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
