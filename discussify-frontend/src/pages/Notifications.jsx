import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI, communityAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineChatAlt,
    HiOutlineUserGroup,
    HiOutlineAnnotation,
    HiOutlineTrash
} from 'react-icons/hi';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [accepting, setAccepting] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationAPI.getAll();
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationAPI.delete(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleAcceptInvite = async (notification) => {
        const communityId = notification.data?.communityId;
        if (!communityId) {
            toast.error('Invalid invitation');
            return;
        }

        setAccepting(notification._id);
        try {
            const response = await communityAPI.join(communityId);
            if (response.data.success) {
                toast.success('Successfully joined the community!');
                // Remove the notification from the list
                setNotifications(prev => prev.filter(n => n._id !== notification._id));
                // Navigate to the community
                navigate(`/community/${notification.data?.communitySlug || communityId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setAccepting(null);
        }
    };

    const clearAll = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) return;

        setDeleting(true);
        try {
            await notificationAPI.clearAll();
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        } finally {
            setDeleting(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post':
                return <HiOutlineAnnotation size={20} />;
            case 'comment':
                return <HiOutlineChatAlt size={20} />;
            case 'community':
            case 'COMMUNITY_INVITE':
                return <HiOutlineUserGroup size={20} />;
            default:
                return <HiOutlineBell size={20} />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return new Date(date).toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)'
            }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--space-2)' }}>Notifications</h1>
                    <p style={{ color: 'var(--secondary-500)', margin: 0 }}>
                        {notifications.length === 0
                            ? 'No notifications'
                            : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`
                        }
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="btn btn-secondary">
                            <HiOutlineCheck size={18} />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="btn btn-ghost"
                            disabled={deleting}
                        >
                            <HiOutlineTrash size={18} />
                            {deleting ? 'Clearing...' : 'Clear all'}
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {notifications.map((notification, index) => (
                        <div
                            key={notification._id}
                            style={{
                                padding: 'var(--space-4)',
                                background: notification.isRead ? 'transparent' : 'var(--primary-50)',
                                borderBottom: index < notifications.length - 1 ? '1px solid var(--secondary-100)' : 'none',
                                display: 'flex',
                                gap: 'var(--space-4)',
                                alignItems: 'flex-start'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: 'var(--primary-100)',
                                color: 'var(--primary-600)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {getIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-1)' }}>
                                    <h4 style={{
                                        fontWeight: notification.isRead ? 500 : 600,
                                        margin: 0,
                                        fontSize: 'var(--font-size-base)'
                                    }}>
                                        {notification.title}
                                    </h4>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--secondary-400)',
                                        whiteSpace: 'nowrap',
                                        marginLeft: 'var(--space-3)'
                                    }}>
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                                <p style={{
                                    color: 'var(--secondary-600)',
                                    marginBottom: 'var(--space-3)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {notification.message}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    {/* Accept Invitation Button for COMMUNITY_INVITE */}
                                    {notification.type === 'COMMUNITY_INVITE' && !notification.isRead && (
                                        <button
                                            onClick={() => handleAcceptInvite(notification)}
                                            className="btn btn-sm btn-primary"
                                            style={{ fontSize: 'var(--font-size-xs)' }}
                                            disabled={accepting === notification._id}
                                        >
                                            <HiOutlineUserGroup size={14} />
                                            {accepting === notification._id ? 'Joining...' : 'Accept Invitation'}
                                        </button>
                                    )}
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="btn btn-sm btn-ghost"
                                            style={{ fontSize: 'var(--font-size-xs)' }}
                                        >
                                            <HiOutlineCheck size={14} />
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="btn btn-sm btn-ghost"
                                        style={{ fontSize: 'var(--font-size-xs)', color: 'var(--error)' }}
                                    >
                                        <HiOutlineTrash size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Unread Indicator */}
                            {!notification.isRead && (
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-500)',
                                    flexShrink: 0,
                                    marginTop: '6px'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <HiOutlineBell className="empty-state-icon" />
                    <h3 className="empty-state-title">No notifications</h3>
                    <p className="empty-state-desc">You're all caught up! Check back later for updates.</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;
