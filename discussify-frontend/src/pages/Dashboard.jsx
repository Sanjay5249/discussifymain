import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { communityAPI } from '../services/api';
import { HiOutlineUserGroup, HiOutlineChatAlt, HiOutlinePlus } from 'react-icons/hi';
import CommunityCard from '../components/CommunityCard';

const Dashboard = () => {
    const { user } = useAuth();
    const [myCommunities, setMyCommunities] = useState([]);
    const [popularCommunities, setPopularCommunities] = useState([]);
    const [recommendedCommunities, setRecommendedCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            // Fetch all data in parallel for better performance
            const [myRes, popularRes, recommendedRes] = await Promise.allSettled([
                communityAPI.getMyCommunities(),
                communityAPI.getPopular(),
                communityAPI.getRecommended()
            ]);

            if (myRes.status === 'fulfilled' && myRes.value.data.success) {
                setMyCommunities(myRes.value.data.data || []);
            }
            if (popularRes.status === 'fulfilled' && popularRes.value.data.success) {
                setPopularCommunities(popularRes.value.data.data || []);
            }
            if (recommendedRes.status === 'fulfilled' && recommendedRes.value.data.success) {
                setRecommendedCommunities(recommendedRes.value.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching communities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
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
            {/* Welcome Header */}
            <div className="page-header">
                <h1 className="page-title">{getGreeting()}, {user?.username}! 👋</h1>
                <p className="page-subtitle">Welcome back to Discussify</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">My Communities</span>
                        <div className="stat-card-icon">
                            <HiOutlineUserGroup size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{myCommunities.length}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Popular Communities</span>
                        <div className="stat-card-icon">
                            <HiOutlineChatAlt size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{popularCommunities.length}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Recommended</span>
                        <div className="stat-card-icon" style={{ background: 'var(--accent-purple)', color: 'white' }}>
                            <HiOutlinePlus size={20} />
                        </div>
                    </div>
                    <p className="stat-card-value">{recommendedCommunities.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => handleTabChange('my')}
                >
                    My Communities
                </button>
                <button
                    className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
                    onClick={() => handleTabChange('popular')}
                >
                    Popular
                </button>
                <button
                    className={`tab ${activeTab === 'recommended' ? 'active' : ''}`}
                    onClick={() => handleTabChange('recommended')}
                >
                    Recommended
                </button>
            </div>

            {/* Community Grid */}
            {activeTab === 'my' && (
                <>
                    {myCommunities.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 'var(--space-6)'
                        }}>
                            {myCommunities.map(community => (
                                <CommunityCard key={community._id} community={community} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <HiOutlineUserGroup className="empty-state-icon" />
                            <h3 className="empty-state-title">No communities yet</h3>
                            <p className="empty-state-desc">Join or create a community to get started</p>
                            <Link to="/create-community" className="btn btn-primary">
                                <HiOutlinePlus /> Create Community
                            </Link>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'popular' && (
                <>
                    {popularCommunities.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 'var(--space-6)'
                        }}>
                            {popularCommunities.map(community => (
                                <CommunityCard key={community._id} community={community} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <HiOutlineChatAlt className="empty-state-icon" />
                            <h3 className="empty-state-title">No popular communities</h3>
                            <p className="empty-state-desc">Be the first to create one!</p>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'recommended' && (
                <>
                    {recommendedCommunities.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 'var(--space-6)'
                        }}>
                            {recommendedCommunities.map(community => (
                                <CommunityCard key={community._id} community={community} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <HiOutlinePlus className="empty-state-icon" />
                            <h3 className="empty-state-title">No recommendations yet</h3>
                            <p className="empty-state-desc">Update your interests to get personalized recommendations</p>
                            <Link to="/profile" className="btn btn-primary">
                                Update Interests
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
