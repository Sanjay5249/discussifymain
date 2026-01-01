import { useState } from 'react';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineLink, HiOutlineX } from 'react-icons/hi';

const CreatePost = ({ communityId, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).slice(0, 5);

        // Validate file sizes
        const validFiles = selectedFiles.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles].slice(0, 5));

        // Create previews
        validFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviews(prev => [...prev, { url: e.target.result, type: 'image' }].slice(0, 5));
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => [...prev, { name: file.name, type: 'file' }].slice(0, 5));
            }
        });
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && files.length === 0 && !linkUrl.trim()) {
            toast.error('Please add some content, files, or a link');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('communityId', communityId);

        if (linkUrl) {
            formData.append('linkUrl', linkUrl);
            formData.append('type', 'link');
        } else if (files.length > 0) {
            files.forEach(file => {
                formData.append('file', file);
            });
            formData.append('type', files[0].type.startsWith('image/') ? 'image' : 'video');
        }

        try {
            const response = await postAPI.create(formData);
            if (response.data.success) {
                toast.success('Post created!');
                setContent('');
                setFiles([]);
                setPreviews([]);
                setLinkUrl('');
                setShowLinkInput(false);
                onPostCreated(response.data.post || response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-card" style={{ marginBottom: 'var(--space-6)' }}>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="form-input"
                    placeholder="Share something with the community..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    style={{ resize: 'none', marginBottom: 'var(--space-4)' }}
                />

                {/* File Previews */}
                {previews.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        flexWrap: 'wrap',
                        marginBottom: 'var(--space-4)'
                    }}>
                        {previews.map((preview, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                {preview.type === 'image' ? (
                                    <img
                                        src={preview.url}
                                        alt={`Preview ${index}`}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'var(--secondary-100)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 'var(--font-size-xs)',
                                        textAlign: 'center',
                                        padding: 'var(--space-2)'
                                    }}>
                                        {preview.name}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'var(--error)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <HiOutlineX size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Link Input */}
                {showLinkInput && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="Enter URL..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                        />
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                            <HiOutlinePhotograph size={18} />
                            Media
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <button
                            type="button"
                            className={`btn btn-ghost btn-sm ${showLinkInput ? 'active' : ''}`}
                            onClick={() => setShowLinkInput(!showLinkInput)}
                        >
                            <HiOutlineLink size={18} />
                            Link
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={loading || (!content.trim() && files.length === 0)}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
