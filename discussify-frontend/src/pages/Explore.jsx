import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communityAPI } from '../services/api';
import { HiOutlineSearch } from 'react-icons/hi';
import CommunityCard from '../components/CommunityCard';

const CATEGORIES = [
    'All', 'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
];

const Explore = () => {
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        filterCommunities();
    }, [search, selectedCategory, communities]);

    const fetchCommunities = async () => {
        try {
            // Use discoverable API if user is available, otherwise use popular
            const response = user?._id
                ? await communityAPI.getDiscoverable(user._id)
                : await communityAPI.getPopular();

            if (response.data.success) {
                setCommunities(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching communities:', error);
            // Fallback to popular communities
            try {
                const response = await communityAPI.getPopular();
                if (response.data.success) {
                    setCommunities(response.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching popular:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const filterCommunities = () => {
        let result = [...communities];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.tags?.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        // Filter by category
        if (selectedCategory !== 'All') {
            result = result.filter(c =>
                c.categories?.includes(selectedCategory)
            );
        }

        setFiltered(result);
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
                <h1 className="page-title">Explore Communities</h1>
                <p className="page-subtitle">Discover communities that match your interests</p>
            </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                {/* Search */}
                <div className="search-container" style={{ maxWidth: '100%', marginBottom: 'var(--space-4)' }}>
                    <HiOutlineSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search communities by name, description, or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ borderRadius: 'var(--radius-md)' }}
                    />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`interest-tag ${selectedCategory === cat ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {filtered.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 'var(--space-6)'
                }}>
                    {filtered.map(community => (
                        <CommunityCard key={community._id} community={community} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <HiOutlineSearch className="empty-state-icon" />
                    <h3 className="empty-state-title">No communities found</h3>
                    <p className="empty-state-desc">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}
        </div>
    );
};

export default Explore;
