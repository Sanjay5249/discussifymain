import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCamera, HiOutlinePencil, HiOutlineX, HiOutlineBell } from 'react-icons/hi';

const INTERESTS = [
    'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
];

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        interests: user?.interests || [],
        profileImage: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [savingSettings, setSavingSettings] = useState(false);

    const defaultNotificationSettings = {
        communityInvites: true,
        communityUpdates: true,
        postNotifications: true,
        commentReplies: true,
        welcomeMessages: true,
        emailNotifications: false
    };

    const [notificationSettings, setNotificationSettings] = useState(
        user?.notificationSettings || defaultNotificationSettings
    );

    // Sync formData when user data changes
    useEffect(() => {
        if (user && !editing) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
                interests: user.interests || [],
                profileImage: null
            });
            setNotificationSettings(user.notificationSettings || defaultNotificationSettings);
        }
    }, [user, editing]);

    const handleNotificationToggle = async (key) => {
        const newSettings = {
            ...notificationSettings,
            [key]: !notificationSettings[key]
        };
        setNotificationSettings(newSettings);

        // Save immediately
        setSavingSettings(true);
        const data = new FormData();
        data.append('notificationSettings', JSON.stringify(newSettings));
        await updateProfile(data);
        setSavingSettings(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, profileImage: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('username', formData.username);
        data.append('bio', formData.bio);
        formData.interests.forEach(interest => {
            data.append('interests', interest);
        });
        if (formData.profileImage) {
            data.append('profileImage', formData.profileImage);
        }

        const result = await updateProfile(data);
        setLoading(false);

        if (result.success) {
            setEditing(false);
            setPreview(null);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setPreview(null);
        setFormData({
            username: user?.username || '',
            bio: user?.bio || '',
            interests: user?.interests || [],
            profileImage: null
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getProfileImage = () => {
        if (preview) return preview;
        if (user?.profileImage) {
            if (user.profileImage.startsWith('http')) {
                return user.profileImage;
            }
            // Handle paths that already include 'uploads/'
            return user.profileImage.startsWith('uploads')
                ? `/${user.profileImage}`
                : `/uploads/${user.profileImage}`;
        }
        return null;
    };

    return (
        <div>
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-info">
                    <div style={{ position: 'relative' }}>
                        <div className="avatar avatar-2xl" style={{ border: '4px solid rgba(255,255,255,0.3)' }}>
                            {getProfileImage() ? (
                                <img src={getProfileImage()} alt={user?.username} />
                            ) : (
                                getInitials(user?.username)
                            )}
                        </div>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <HiOutlineCamera size={18} color="var(--primary-600)" />
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="profile-details">
                        {editing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: 700,
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-2) var(--space-3)',
                                    color: 'white',
                                    marginBottom: 'var(--space-2)'
                                }}
                            />
                        ) : (
                            <h1 className="profile-name">{user?.username}</h1>
                        )}
                        <p className="profile-username">{user?.email}</p>

                        {editing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-3)',
                                    color: 'white',
                                    resize: 'none',
                                    width: '100%',
                                    maxWidth: '400px'
                                }}
                                rows={3}
                            />
                        ) : (
                            <p className="profile-bio">{user?.bio || 'No bio yet'}</p>
                        )}
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        {!editing ? (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditing(true)}
                            >
                                <HiOutlinePencil size={18} />
                                Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={cancelEdit}
                                    style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="profile-stat">
                        <p className="profile-stat-value">{user?.joinedCommunities?.length || 0}</p>
                        <p className="profile-stat-label">Communities</p>
                    </div>
                    <div className="profile-stat">
                        <p className="profile-stat-value">{user?.interests?.length || 0}</p>
                        <p className="profile-stat-label">Interests</p>
                    </div>
                </div>
            </div>

            {/* Interests Section */}
            <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>
                    {editing ? 'Update Your Interests' : 'Interests'}
                </h3>

                {editing ? (
                    <div className="interests-grid">
                        {INTERESTS.map(interest => (
                            <button
                                key={interest}
                                type="button"
                                className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                                onClick={() => toggleInterest(interest)}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {user?.interests?.length > 0 ? (
                            user.interests.map(interest => (
                                <span key={interest} className="badge badge-primary">
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <p style={{ color: 'var(--secondary-500)' }}>No interests selected</p>
                        )}
                    </div>
                )}
            </div>

            {/* Account Info */}
            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Account Information</h3>
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 'var(--space-1)' }}>
                            Email Address
                        </p>
                        <p style={{ fontWeight: 500, marginBottom: 0 }}>{user?.email}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 'var(--space-1)' }}>
                            Role
                        </p>
                        <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-primary'}`}>
                            {user?.role || 'user'}
                        </span>
                    </div>
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 'var(--space-1)' }}>
                            Member Since
                        </p>
                        <p style={{ fontWeight: 500, marginBottom: 0 }}>
                            {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginBottom: 'var(--space-1)' }}>
                            Email Verified
                        </p>
                        <span className={`badge ${user?.isEmailVerified ? 'badge-success' : 'badge-warning'}`}>
                            {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="glass-card" style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <HiOutlineBell size={24} />
                    <h3 style={{ margin: 0 }}>Notification Settings</h3>
                    {savingSettings && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)' }}>Saving...</span>}
                </div>

                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {[
                        { key: 'communityInvites', label: 'Community Invites', desc: 'Receive notifications when invited to join a community' },
                        { key: 'communityUpdates', label: 'Community Updates', desc: 'Updates from communities you have joined' },
                        { key: 'postNotifications', label: 'Post Notifications', desc: 'Notifications about new posts in your communities' },
                        { key: 'commentReplies', label: 'Comment Replies', desc: 'When someone replies to your comments' },
                        { key: 'welcomeMessages', label: 'Welcome Messages', desc: 'Welcome and informational notifications' },
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important notifications via email' }
                    ].map(({ key, label, desc }) => (
                        <div
                            key={key}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-3)',
                                background: 'var(--secondary-50)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 500, marginBottom: 'var(--space-1)' }}>{label}</p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', margin: 0 }}>{desc}</p>
                            </div>
                            <button
                                onClick={() => handleNotificationToggle(key)}
                                style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s ease',
                                    background: notificationSettings[key] ? 'var(--primary-500)' : 'var(--secondary-300)'
                                }}
                            >
                                <span style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: notificationSettings[key] ? '23px' : '3px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
