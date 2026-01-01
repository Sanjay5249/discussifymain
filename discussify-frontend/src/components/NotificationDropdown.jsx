import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineChatAlt,
    HiOutlineUserGroup,
    HiOutlineAnnotation
} from 'react-icons/hi';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 120000); // Every 2 minutes (reduced for performance)
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationAPI.getAll();
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.pagination?.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationAPI.getUnreadCount();
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            // Silently fail for count check
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post':
                return <HiOutlineAnnotation size={18} />;
            case 'comment':
                return <HiOutlineChatAlt size={18} />;
            case 'community':
            case 'COMMUNITY_INVITE':
                return <HiOutlineUserGroup size={18} />;
            default:
                return <HiOutlineBell size={18} />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn btn-icon btn-ghost"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ position: 'relative', overflow: 'visible' }}
            >
                <HiOutlineBell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--error)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 600,
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="dropdown-menu" style={{
                    width: '360px',
                    maxHeight: '480px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--secondary-100)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 'var(--font-size-sm)' }}
                            >
                                <HiOutlineCheck size={16} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {loading ? (
                            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                                <div className="loader" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.slice(0, 10).map(notification => (
                                <div
                                    key={notification._id}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: notification.isRead ? 'transparent' : 'var(--primary-50)',
                                        borderBottom: '1px solid var(--secondary-50)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: 'var(--space-3)',
                                        alignItems: 'flex-start',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--secondary-50)'}
                                    onMouseLeave={(e) => e.target.style.background = notification.isRead ? 'transparent' : 'var(--primary-50)'}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
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
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontWeight: notification.isRead ? 400 : 600,
                                            marginBottom: '2px',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {notification.title}
                                        </p>
                                        <p style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--secondary-500)',
                                            marginBottom: '2px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {notification.message}
                                        </p>
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--secondary-400)'
                                        }}>
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.isRead && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-500)',
                                            flexShrink: 0,
                                            marginTop: '6px'
                                        }} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: 'var(--space-8)',
                                textAlign: 'center',
                                color: 'var(--secondary-400)'
                            }}>
                                <HiOutlineBell size={32} style={{ marginBottom: 'var(--space-2)', opacity: 0.5 }} />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: 'var(--space-2) var(--space-4)',
                        borderTop: '1px solid var(--secondary-100)',
                        textAlign: 'center'
                    }}>
                        <Link
                            to="/notifications"
                            className="btn btn-ghost btn-sm w-full"
                            onClick={() => setShowDropdown(false)}
                            style={{ fontSize: 'var(--font-size-sm)' }}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
