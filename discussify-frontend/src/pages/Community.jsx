import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { communityAPI, postAPI } from '../services/api';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import InviteModal from '../components/InviteModal';
import EditCommunityModal from '../components/EditCommunityModal';
import {
    HiOutlineUsers,
    HiOutlineChatAlt,
    HiOutlineUserAdd,
    HiOutlineLogout,
    HiOutlineLockClosed,
    HiOutlineGlobe,
    HiOutlinePencil
} from 'react-icons/hi';

const Community = () => {
    const { idOrSlug } = useParams();
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetchCommunity();
    }, [idOrSlug]);

    // Recalculate admin/member status when user changes
    useEffect(() => {
        if (community && user?._id) {
            const userId = user._id?.toString ? user._id.toString() : user._id;

            // Check membership
            const memberCheck = community.members?.some(m => {
                const memberId = m.user?._id
                    ? m.user._id.toString()
                    : (m.user?.toString ? m.user.toString() : m.user);
                return memberId === userId;
            });
            setIsMember(memberCheck);

            // Check if user is admin
            const adminId = typeof community.admin === 'object'
                ? community.admin?._id?.toString()
                : community.admin?.toString();
            setIsAdmin(adminId === userId);
        }
    }, [community, user?._id]);

    const fetchCommunity = async () => {
        setLoading(true);
        try {
            const response = await communityAPI.getOne(idOrSlug);
            if (response.data.success) {
                const communityData = response.data.data;
                setCommunity(communityData);

                // Check membership - only if user is logged in
                if (user?._id) {
                    const userId = user._id?.toString ? user._id.toString() : user._id;

                    const memberCheck = communityData.members?.some(m => {
                        const memberId = m.user?._id
                            ? m.user._id.toString()
                            : (m.user?.toString ? m.user.toString() : m.user);
                        return memberId === userId;
                    });
                    setIsMember(memberCheck);

                    // Check if user is admin - handle both object and string types
                    const adminId = typeof communityData.admin === 'object'
                        ? communityData.admin?._id?.toString()
                        : communityData.admin?.toString();
                    setIsAdmin(adminId === userId);

                    // Fetch posts if member or public community
                    if (memberCheck || !communityData.isPrivate) {
                        fetchPosts(communityData._id);
                    }
                } else {
                    // For non-logged in users, only fetch posts for public communities
                    if (!communityData.isPrivate) {
                        fetchPosts(communityData._id);
                    }
                }
            } else {
                toast.error('Community not found');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error loading community:', error);
            // Only show error and redirect for actual errors, not auth issues
            if (error.response?.status === 404) {
                toast.error('Community not found');
                navigate('/dashboard');
            } else if (error.response?.status !== 401 && error.response?.status !== 403) {
                toast.error('Failed to load community');
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (communityId) => {
        try {
            // Use postAPI to get real posts from the database
            const response = await postAPI.getCommunityPosts(communityId);
            if (response.data.success) {
                setPosts(response.data.posts || response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleJoin = async () => {
        setJoining(true);
        try {
            const response = await communityAPI.join(idOrSlug);
            if (response.data.success) {
                toast.success('Joined community successfully!');
                setIsMember(true);
                fetchCommunity();
                // Refresh user data to update joinedCommunities count
                await checkAuth();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join community');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this community?')) return;

        try {
            const response = await communityAPI.leave(idOrSlug);
            if (response.data.success) {
                toast.success('Left community');
                setIsMember(false);
                // Refresh user data to update joinedCommunities count
                await checkAuth();
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave community');
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        // Update community post count in real-time
        setCommunity(prev => prev ? { ...prev, postCount: (prev.postCount || 0) + 1 } : prev);
    };

    const handleVote = async (postId) => {
        try {
            await postAPI.vote(postId);
            // Update post in state
            setPosts(prev => prev.map(post => {
                if (post._id === postId) {
                    const hasVoted = post.upvotes?.includes(user._id);
                    return {
                        ...post,
                        upvotes: hasVoted
                            ? post.upvotes.filter(id => id !== user._id)
                            : [...(post.upvotes || []), user._id],
                        voteCount: hasVoted ? (post.voteCount || 0) - 1 : (post.voteCount || 0) + 1
                    };
                }
                return post;
            }));
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader"></div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Community not found</h3>
            </div>
        );
    }

    return (
        <div>
            {/* Community Header */}
            <div style={{
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                marginBottom: 'var(--space-8)'
            }}>
                {/* Cover Image */}
                <div style={{ height: '200px', position: 'relative' }}>
                    {community.coverImage && (
                        <img
                            src={community.coverImage.startsWith('http') ? community.coverImage : community.coverImage}
                            alt={community.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'
                    }}></div>
                </div>

                {/* Community Info */}
                <div style={{ padding: 'var(--space-6)', color: 'white', marginTop: '-60px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 700,
                            color: 'var(--primary-600)',
                            border: '4px solid white'
                        }}>
                            {community.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0 }}>{community.name}</h1>
                                {community.isPrivate ? (
                                    <HiOutlineLockClosed size={20} title="Private community" />
                                ) : (
                                    <HiOutlineGlobe size={20} title="Public community" />
                                )}
                            </div>
                        </div>
                    </div>

                    <p style={{ marginBottom: 'var(--space-4)', opacity: 0.9 }}>{community.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <HiOutlineUsers size={18} />
                            {community.memberCount || 0} members
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <HiOutlineChatAlt size={18} />
                            {community.postCount || 0} posts
                        </span>
                    </div>

                    {/* Categories */}
                    {community.categories && community.categories.length > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                            {community.categories.map(cat => (
                                <span
                                    key={cat}
                                    style={{
                                        padding: 'var(--space-1) var(--space-3)',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        {isMember ? (
                            <>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowEdit(true)}
                                        className="btn btn-secondary"
                                    >
                                        <HiOutlinePencil size={18} />
                                        Edit Community
                                    </button>
                                )}
                                {(isAdmin || community.moderators?.includes(user._id)) && (
                                    <button
                                        onClick={() => setShowInvite(true)}
                                        className="btn btn-secondary"
                                    >
                                        <HiOutlineUserAdd size={18} />
                                        Invite Members
                                    </button>
                                )}
                                {!isAdmin && (
                                    <button
                                        onClick={handleLeave}
                                        className="btn btn-ghost"
                                        style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                                    >
                                        <HiOutlineLogout size={18} />
                                        Leave
                                    </button>
                                )}
                            </>
                        ) : community.isPrivate ? (
                            <button
                                className="btn btn-secondary"
                                disabled={true}
                                title="This is a private community. You need an invitation to join."
                            >
                                <HiOutlineLockClosed size={18} />
                                Invitation Required
                            </button>
                        ) : (
                            <button
                                onClick={handleJoin}
                                className="btn btn-secondary"
                                disabled={joining}
                            >
                                {joining ? 'Joining...' : 'Join Community'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isMember || !community.isPrivate ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
                    {/* Posts */}
                    <div>
                        {isMember && (
                            <CreatePost
                                communityId={community._id}
                                onPostCreated={handlePostCreated}
                            />
                        )}

                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onVote={handleVote}
                                    currentUserId={user._id}
                                />
                            ))
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <HiOutlineChatAlt className="empty-state-icon" />
                                <h3 className="empty-state-title">No discussions yet</h3>
                                <p className="empty-state-desc">Be the first to start a discussion!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Rules */}
                        {community.rules && community.rules.length > 0 && (
                            <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Community Rules</h3>
                                <ol style={{ paddingLeft: 'var(--space-5)', margin: 0 }}>
                                    {community.rules.map((rule, index) => (
                                        <li key={index} style={{ marginBottom: 'var(--space-3)' }}>
                                            <strong>{rule.title}</strong>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', margin: 0 }}>
                                                {rule.description}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* About */}
                        <div className="glass-card">
                            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>About</h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-600)' }}>
                                {community.description}
                            </p>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--secondary-500)',
                                marginTop: 'var(--space-4)',
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--secondary-100)'
                            }}>
                                Created {new Date(community.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <HiOutlineLockClosed className="empty-state-icon" />
                    <h3 className="empty-state-title">This is a private community</h3>
                    <p className="empty-state-desc">You need an invitation to view content</p>
                </div>
            )}

            {/* Invite Modal */}
            {showInvite && (
                <InviteModal
                    communityId={community._id}
                    communityName={community.name}
                    onClose={() => setShowInvite(false)}
                />
            )}

            {/* Edit Community Modal */}
            {showEdit && (
                <EditCommunityModal
                    community={community}
                    onClose={() => setShowEdit(false)}
                    onUpdate={(updatedCommunity) => setCommunity(updatedCommunity)}
                />
            )}
        </div>
    );
};

export default Community;
