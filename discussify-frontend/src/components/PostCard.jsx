import { useState, useEffect } from 'react';
import { HiOutlineThumbUp, HiOutlineChatAlt, HiOutlineShare, HiThumbUp } from 'react-icons/hi';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post, onVote, currentUserId }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    const hasVoted = post.upvotes?.includes(currentUserId);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const fetchComments = async () => {
        if (comments.length > 0) return; // Already loaded
        setLoadingComments(true);
        try {
            const response = await postAPI.getComments(post._id);
            if (response.data.success) {
                setComments(response.data.comments || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await postAPI.reply(post._id, { content: newComment });
            if (response.data.success) {
                setComments(prev => [response.data.comment, ...prev]);
                setCommentCount(prev => prev + 1);
                setNewComment('');
                toast.success('Comment posted!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const getProfileImage = (author) => {
        if (!author?.profileImage) return null;
        if (author.profileImage.startsWith('http')) return author.profileImage;
        return author.profileImage.startsWith('uploads')
            ? `/${author.profileImage}`
            : `/uploads/${author.profileImage}`;
    };

    const author = post.author || {};

    return (
        <div className="post-card">
            {/* Header */}
            <div className="post-header">
                <div className="avatar avatar-md">
                    {author.profileImage ? (
                        <img
                            src={getProfileImage(author)}
                            alt={author.username}
                        />
                    ) : (
                        getInitials(author.username)
                    )}
                </div>
                <div className="post-author-info">
                    <p className="post-author-name">{author.username || 'Unknown User'}</p>
                    <p className="post-meta">{formatDate(post.createdAt)}</p>
                </div>
            </div>

            {/* Content */}
            <div className="post-content">
                {post.content}
            </div>

            {/* Media */}
            {post.images && post.images.length > 0 && (
                <div className="post-media">
                    {post.images.length === 1 ? (
                        <img
                            src={post.images[0].startsWith('http') ? post.images[0] : `/uploads/${post.images[0]}`}
                            alt="Post image"
                        />
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'var(--space-2)'
                        }}>
                            {post.images.slice(0, 4).map((img, index) => (
                                <img
                                    key={index}
                                    src={img.startsWith('http') ? img : `/uploads/${img}`}
                                    alt={`Post image ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Link Preview */}
            {post.linkUrl && (
                <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        padding: 'var(--space-4)',
                        background: 'var(--secondary-50)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)',
                        color: 'var(--primary-600)',
                        wordBreak: 'break-all'
                    }}
                >
                    🔗 {post.linkUrl}
                </a>
            )}

            {/* Actions */}
            <div className="post-actions">
                <button
                    className={`post-action-btn ${hasVoted ? 'upvoted' : ''}`}
                    onClick={() => onVote(post._id)}
                >
                    {hasVoted ? <HiThumbUp size={18} /> : <HiOutlineThumbUp size={18} />}
                    <span>{post.voteCount || 0}</span>
                </button>
                <button
                    className="post-action-btn"
                    onClick={handleToggleComments}
                >
                    <HiOutlineChatAlt size={18} />
                    <span>{commentCount}</span>
                </button>
                <button className="post-action-btn">
                    <HiOutlineShare size={18} />
                    <span>Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--secondary-100)'
                }}>
                    {/* Comment Input */}
                    <form onSubmit={handleSubmitComment} style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submittingComment}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submittingComment || !newComment.trim()}
                            >
                                {submittingComment ? '...' : 'Post'}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    {loadingComments ? (
                        <p style={{ color: 'var(--secondary-500)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                            Loading comments...
                        </p>
                    ) : comments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {comments.map(comment => (
                                <div key={comment._id} style={{
                                    display: 'flex',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-3)',
                                    background: 'var(--secondary-50)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div className="avatar avatar-sm">
                                        {comment.author?.profileImage ? (
                                            <img
                                                src={getProfileImage(comment.author)}
                                                alt={comment.author.username}
                                            />
                                        ) : (
                                            getInitials(comment.author?.username)
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                {comment.author?.username || 'Unknown'}
                                            </span>
                                            <span style={{ color: 'var(--secondary-400)', fontSize: 'var(--font-size-xs)' }}>
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--secondary-700)' }}>
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--secondary-500)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                            No comments yet. Be the first to comment!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostCard;

