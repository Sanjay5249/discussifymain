import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineEye, HiOutlineTrash, HiOutlineX, HiOutlineUsers, HiOutlineChatAlt } from 'react-icons/hi';

const CommunityManagement = () => {
    const [communities, setCommunities] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (search) {
            const searchLower = search.toLowerCase();
            setFiltered(communities.filter(c =>
                (c.name || '').toLowerCase().includes(searchLower) ||
                (c.description || '').toLowerCase().includes(searchLower)
            ));
        } else {
            setFiltered(communities);
        }
    }, [search, communities]);

    const fetchCommunities = async () => {
        try {
            const response = await adminAPI.getAllCommunities();
            if (response.data.success) {
                setCommunities(response.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to fetch communities');
        } finally {
            setLoading(false);
        }
    };

    const viewPosts = async (community) => {
        setSelectedCommunity(community);
        setLoadingPosts(true);
        try {
            const response = await adminAPI.getCommunityPosts(community._id);
            if (response.data.success) {
                setPosts(response.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await adminAPI.deletePost(postId);
            if (response.data.success) {
                toast.success('Post deleted successfully');
                setPosts(prev => prev.filter(p => p._id !== postId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleDeleteCommunity = async (communityId, communityName) => {
        if (!confirm(`Are you sure you want to delete "${communityName}"?`)) return;

        try {
            const response = await adminAPI.deleteCommunity(communityId);
            if (response.data.success) {
                toast.success('Community deleted successfully');
                setCommunities(prev => prev.filter(c => c._id !== communityId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete community');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'C';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                <h1 className="page-title">Community Management</h1>
                <p className="page-subtitle">Manage platform communities and their content</p>
            </div>

            {/* Search */}
            <div className="search-container" style={{ marginBottom: 'var(--space-6)', maxWidth: '100%' }}>
                <HiOutlineSearch className="search-icon" size={20} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search communities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)' }}
                />
            </div>

            {/* Communities Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                {filtered.map(community => (
                    <div key={community._id} className="glass-card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <div
                                className="avatar avatar-md"
                                style={{
                                    background: community.coverImage ? 'transparent' : 'var(--gradient-primary)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                {community.coverImage ? (
                                    <img
                                        src={community.coverImage.startsWith('http') ? community.coverImage : community.coverImage}
                                        alt={community.name}
                                        style={{ borderRadius: 'var(--radius-md)' }}
                                    />
                                ) : (
                                    getInitials(community.name)
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: 'var(--space-1)' }}>{community.name}</h4>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <HiOutlineUsers size={14} />
                                        {community.memberCount || 0}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <HiOutlineChatAlt size={14} />
                                        {community.postCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--secondary-600)',
                            marginBottom: 'var(--space-3)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {community.description}
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                            {community.categories?.slice(0, 2).map(cat => (
                                <span key={cat} className="badge badge-primary">{cat}</span>
                            ))}
                            <span className={`badge ${community.isPrivate ? 'badge-warning' : 'badge-success'}`}>
                                {community.isPrivate ? 'Private' : 'Public'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => viewPosts(community)}
                                style={{ flex: 1 }}
                            >
                                <HiOutlineEye size={16} />
                                View Posts
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteCommunity(community._id, community.name)}
                                title="Delete community"
                            >
                                <HiOutlineTrash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <p>No communities found</p>
                </div>
            )}

            {/* Posts Modal */}
            {selectedCommunity && (
                <div className="modal-overlay" onClick={() => setSelectedCommunity(null)}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '700px' }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedCommunity.name} - Discussions</h2>
                            <button className="modal-close" onClick={() => setSelectedCommunity(null)}>
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {loadingPosts ? (
                                <div className="loading-overlay">
                                    <div className="loader"></div>
                                </div>
                            ) : posts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    {posts.map(post => (
                                        <div
                                            key={post._id}
                                            style={{
                                                padding: 'var(--space-4)',
                                                background: 'var(--secondary-50)',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                                                    {post.author?.username || 'Unknown'}
                                                </span>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--secondary-400)' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{
                                                marginBottom: 'var(--space-3)',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {post.content}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)' }}>
                                                    <span>👍 {post.voteCount || 0}</span>
                                                    <span>💬 {post.commentCount || 0}</span>
                                                    {post.reports?.length > 0 && (
                                                        <span className="badge badge-error">
                                                            {post.reports.length} reports
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeletePost(post._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--secondary-500)', padding: 'var(--space-8)' }}>
                                    No discussions in this community yet
                                </p>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedCommunity(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityManagement;
