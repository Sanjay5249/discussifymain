import { useState, useRef } from 'react';
import { communityAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

const CATEGORIES = [
    'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
];

const EditCommunityModal = ({ community, onClose, onUpdate }) => {
    const [name, setName] = useState(community.name || '');
    const [description, setDescription] = useState(community.description || '');
    const [categories, setCategories] = useState(community.categories || []);
    const [isPrivate, setIsPrivate] = useState(community.isPrivate || false);
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(community.coverImage || null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleCategoryToggle = (category) => {
        setCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Community name is required');
            return;
        }

        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }

        if (categories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            categories.forEach(cat => formData.append('categories', cat));
            formData.append('isPrivate', isPrivate);

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            const response = await communityAPI.update(community._id, formData);
            if (response.data.success) {
                toast.success('Community updated successfully!');
                onUpdate(response.data.data);
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update community');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Community</h2>
                    <button className="modal-close" onClick={onClose}>
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Cover Image */}
                        <div className="form-group">
                            <label className="form-label">Cover Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    height: '120px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px dashed var(--secondary-300)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    background: coverPreview ? `url(${coverPreview}) center/cover` : 'var(--secondary-50)'
                                }}
                            >
                                {!coverPreview && (
                                    <div style={{ textAlign: 'center', color: 'var(--secondary-500)' }}>
                                        <HiOutlinePhotograph size={32} />
                                        <p style={{ margin: 'var(--space-2) 0 0' }}>Click to upload cover image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Community Name */}
                        <div className="form-group">
                            <label className="form-label">Community Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter community name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                placeholder="Describe your community..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={1000}
                            />
                        </div>

                        {/* Categories */}
                        <div className="form-group">
                            <label className="form-label">Categories</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat)}
                                        style={{
                                            padding: 'var(--space-2) var(--space-3)',
                                            borderRadius: 'var(--radius-full)',
                                            border: categories.includes(cat)
                                                ? '2px solid var(--primary-500)'
                                                : '2px solid var(--secondary-200)',
                                            background: categories.includes(cat)
                                                ? 'var(--primary-100)'
                                                : 'transparent',
                                            color: categories.includes(cat)
                                                ? 'var(--primary-700)'
                                                : 'var(--secondary-600)',
                                            fontSize: 'var(--font-size-sm)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Setting */}
                        <div className="form-group">
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>
                                    <strong>Private Community</strong>
                                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)' }}>
                                        Only invited members can join and view content
                                    </p>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCommunityModal;
