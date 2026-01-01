import { useState } from 'react';
import { communityAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineMail } from 'react-icons/hi';

const InviteModal = ({ communityId, communityName, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter an email');
            return;
        }

        setLoading(true);
        try {
            const response = await communityAPI.invite(communityId, { email });
            if (response.data.success) {
                toast.success('Invitation sent successfully!');
                setEmail('');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Invite to {communityName}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ marginBottom: 'var(--space-4)', color: 'var(--secondary-600)' }}>
                            Enter the email address of the person you want to invite.
                        </p>
                        <div className="form-group">
                            <div className="form-input-icon">
                                <HiOutlineMail className="icon" size={20} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteModal;
