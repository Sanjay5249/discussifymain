import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', role: '', isActive: true });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (search) {
            const searchLower = search.toLowerCase();
            setFiltered(users.filter(u =>
                u.username.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            ));
        } else {
            setFiltered(users);
        }
    }, [search, users]);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getAllUsers();
            if (response.data.success) {
                setUsers(response.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            role: user.role,
            isActive: user.isActive
        });
    };

    const handleUpdate = async () => {
        try {
            const response = await adminAPI.updateUser(editingUser._id, editForm);
            if (response.data.success) {
                toast.success('User updated successfully');
                setUsers(prev => prev.map(u =>
                    u._id === editingUser._id ? { ...u, ...editForm } : u
                ));
                setEditingUser(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDelete = async (userId, username) => {
        if (!confirm(`Are you sure you want to delete user "${username}"? This will deactivate their account.`)) return;

        try {
            const response = await adminAPI.deleteUser(userId);
            if (response.data.success) {
                toast.success('User deleted successfully');
                setUsers(prev => prev.filter(u => u._id !== userId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
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
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage platform users</p>
            </div>

            {/* Search */}
            <div className="search-container" style={{ marginBottom: 'var(--space-6)', maxWidth: '100%' }}>
                <HiOutlineSearch className="search-icon" size={20} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)' }}
                />
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div className="avatar avatar-sm">
                                            {user.profileImage ? (
                                                <img
                                                    src={user.profileImage.startsWith('http') ? user.profileImage : (user.profileImage.startsWith('uploads') ? `/${user.profileImage}` : `/uploads/${user.profileImage}`)}
                                                    alt={user.username}
                                                />
                                            ) : (
                                                getInitials(user.username)
                                            )}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{user.username}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.role === 'admin' ? 'badge-success' :
                                        user.role === 'moderator' ? 'badge-info' :
                                            'badge-primary'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => openEditModal(user)}
                                            title="Edit user"
                                        >
                                            <HiOutlinePencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleDelete(user._id, user.username)}
                                            title="Delete user"
                                            style={{ color: 'var(--error)' }}
                                        >
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <p>No users found</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit User</h2>
                            <button className="modal-close" onClick={() => setEditingUser(null)}>
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-input form-select"
                                    value={editForm.role}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="user">User</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <span>Active Account</span>
                                </label>
                            </div>

                            <p style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--secondary-500)',
                                background: 'var(--secondary-50)',
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 0
                            }}>
                                Note: Email address cannot be edited.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdate}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
