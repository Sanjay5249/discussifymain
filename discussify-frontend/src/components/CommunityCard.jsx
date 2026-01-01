import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineChatAlt, HiOutlineUserAdd } from 'react-icons/hi';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CommunityCard = ({ community, onJoinSuccess }) => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'C';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Check if user is already a member
    const isMember = community.members?.some(
        m => m.user === user?._id || m.user?._id === user?._id || m.user?.toString() === user?._id?.toString()
    ) || community.admin === user?._id || community.admin?._id === user?._id;

    const handleJoin = async (e) => {
        e.preventDefault(); // Prevent navigating to community page
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to join communities');
            navigate('/login');
            return;
        }

        setJoining(true);
        try {
            const response = await communityAPI.join(community.slug || community._id);
            if (response.data.success) {
                toast.success(`Joined ${community.name}!`);
                setHasJoined(true);
                // Refresh user data to update joinedCommunities count
                await checkAuth();
                if (onJoinSuccess) {
                    onJoinSuccess(community._id);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join community');
        } finally {
            setJoining(false);
        }
    };

    const handleViewClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/community/${community.slug || community._id}`);
    };

    return (
        <div className="community-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={`/community/${community.slug || community._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="community-cover">
                    {community.coverImage ? (
                        <img
                            src={community.coverImage.startsWith('http') ? community.coverImage : community.coverImage}
                            alt={community.name}
                        />
                    ) : null}
                    <div className="community-avatar">
                        {community.icon ? (
                            <img
                                src={community.icon.startsWith('http') ? community.icon : community.icon}
                                alt={community.name}
                            />
                        ) : (
                            getInitials(community.name)
                        )}
                    </div>
                </div>
                <div className="community-body">
                    <h3 className="community-name">{community.name}</h3>
                    <p className="community-desc">{community.description}</p>
                    <div className="community-meta">
                        <span className="community-stat">
                            <HiOutlineUsers size={16} />
                            {community.memberCount || 0} members
                        </span>
                        <span className="community-stat">
                            <HiOutlineChatAlt size={16} />
                            {community.postCount || 0} posts
                        </span>
                    </div>
                    {community.categories && community.categories.length > 0 && (
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            {community.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="badge badge-primary">{cat}</span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>

            {/* Join/View Button */}
            <div style={{ padding: '0 var(--space-4) var(--space-4)', marginTop: 'auto' }}>
                {isMember || hasJoined ? (
                    <button
                        className="btn btn-secondary w-full"
                        onClick={handleViewClick}
                        style={{ width: '100%' }}
                    >
                        View Community
                    </button>
                ) : (
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleJoin}
                        disabled={joining}
                        style={{ width: '100%' }}
                    >
                        {joining ? (
                            'Joining...'
                        ) : (
                            <>
                                <HiOutlineUserAdd size={18} />
                                Join Community
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CommunityCard;

