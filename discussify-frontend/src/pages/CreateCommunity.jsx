import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph } from 'react-icons/hi';

const CATEGORIES = [
    'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
];

const CreateCommunity = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categories: [],
        isPrivate: false,
        coverImage: null,
        rules: [{ title: '', description: '' }]
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, coverImage: 'Image must be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, coverImage: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const toggleCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const handleRuleChange = (index, field, value) => {
        const newRules = [...formData.rules];
        newRules[index][field] = value;
        setFormData(prev => ({ ...prev, rules: newRules }));
    };

    const addRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [...prev.rules, { title: '', description: '' }]
        }));
    };

    const removeRule = (index) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Community name must be at least 3 characters';
        }
        if (!formData.description) {
            newErrors.description = 'Description is required';
        }
        if (formData.categories.length === 0) {
            newErrors.categories = 'Select at least one category';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('isPrivate', formData.isPrivate);
        formData.categories.forEach(cat => {
            data.append('categories', cat);
        });
        if (formData.coverImage) {
            data.append('coverImage', formData.coverImage);
        }
        // Filter out empty rules
        const validRules = formData.rules.filter(r => r.title && r.description);
        if (validRules.length > 0) {
            data.append('rules', JSON.stringify(validRules));
        }

        try {
            const response = await communityAPI.create(data);
            if (response.data.success) {
                toast.success('Community created successfully!');
                navigate(`/community/${response.data.data.slug || response.data.data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Create Community</h1>
                <p className="page-subtitle">Build your own community and invite others to join</p>
            </div>

            <div className="glass-card" style={{ maxWidth: '700px' }}>
                <form onSubmit={handleSubmit}>
                    {/* Cover Image */}
                    <div className="form-group">
                        <label className="form-label">Cover Image</label>
                        <div
                            className="file-upload"
                            style={{
                                height: preview ? 'auto' : '160px',
                                padding: preview ? 0 : 'var(--space-8)',
                                overflow: 'hidden'
                            }}
                        >
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={preview}
                                        alt="Cover preview"
                                        style={{
                                            width: '100%',
                                            height: '160px',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.4)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                    >
                                        <span style={{ color: 'white', fontWeight: 500 }}>Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <HiOutlinePhotograph className="file-upload-icon" />
                                    <p className="file-upload-text">
                                        <strong>Click to upload</strong> cover image
                                    </p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        {errors.coverImage && <p className="form-error">{errors.coverImage}</p>}
                    </div>

                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label">Community Name *</label>
                        <input
                            type="text"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Enter community name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            name="description"
                            className={`form-input ${errors.description ? 'error' : ''}`}
                            placeholder="What is your community about?"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                        {errors.description && <p className="form-error">{errors.description}</p>}
                    </div>

                    {/* Categories */}
                    <div className="form-group">
                        <label className="form-label">Categories * (select at least one)</label>
                        <div className="interests-grid">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`interest-tag ${formData.categories.includes(cat) ? 'selected' : ''}`}
                                    onClick={() => toggleCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {errors.categories && <p className="form-error">{errors.categories}</p>}
                    </div>

                    {/* Privacy */}
                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleChange}
                            />
                            <span>Make this community private</span>
                        </label>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-500)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                            Private communities require an invitation to join
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="form-group">
                        <label className="form-label">Community Rules (Optional)</label>
                        {formData.rules.map((rule, index) => (
                            <div key={index} style={{
                                padding: 'var(--space-4)',
                                background: 'var(--secondary-50)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Rule {index + 1}</span>
                                    {formData.rules.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRule(index)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--error)',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-sm)'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Rule title"
                                    value={rule.title}
                                    onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                                    style={{ marginBottom: 'var(--space-2)' }}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Rule description"
                                    value={rule.description}
                                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={addRule}
                        >
                            + Add Rule
                        </button>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader loader-sm" style={{ borderTopColor: 'white' }}></span>
                                    Creating...
                                </>
                            ) : (
                                'Create Community'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunity;
