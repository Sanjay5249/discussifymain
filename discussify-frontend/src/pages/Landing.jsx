import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    HiOutlineUserGroup,
    HiOutlineChatAlt2,
    HiOutlineShare,
    HiOutlineLightningBolt
} from 'react-icons/hi';

const Landing = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Streamline Your Team,<br />
                        Supercharge Your Workflow
                    </h1>
                    <p className="hero-subtitle">
                        All-in-one platform to plan, collaborate, and deliver — faster and smarter.
                        Connect with like-minded people, share your thoughts, and engage in meaningful conversations.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get started for Free →
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* App Showcase Section */}
            <section className="app-showcase-section">
                <div className="container">
                    <div className="showcase-content">
                        <div className="showcase-text">
                            <span className="showcase-badge">✨ Powerful Dashboard</span>
                            <h2 className="showcase-title">
                                Everything you need,<br />
                                all in one place
                            </h2>
                            <p className="showcase-desc">
                                Manage your communities, track engagement, and discover new discussions
                                with our intuitive dashboard. Get real-time insights about your
                                community growth and member activity.
                            </p>
                            <ul className="showcase-features">
                                <li>📊 Track community statistics at a glance</li>
                                <li>🔍 Discover popular and recommended communities</li>
                                <li>👥 Manage members and invitations easily</li>
                                <li>📝 Create and share posts with rich content</li>
                            </ul>
                        </div>
                        <div className="showcase-image">
                            <img src="/app-showcase.png" alt="Discussify Dashboard" />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-image">
                            <img src="/about-community.png" alt="Community Collaboration" />
                            <div className="about-image-overlay"></div>
                        </div>
                        <div className="about-text">
                            <span className="about-badge">🌟 About Discussify</span>
                            <h2 className="about-title">
                                Building Meaningful<br />
                                Connections Together
                            </h2>
                            <p className="about-desc">
                                Discussify is more than just a platform — it's a vibrant ecosystem where
                                ideas come to life. We believe in the power of community-driven discussions
                                and collaborative learning.
                            </p>
                            <p className="about-desc">
                                Founded with the vision of connecting passionate individuals worldwide,
                                Discussify provides the tools you need to create, grow, and nurture
                                communities around topics you love.
                            </p>
                            <div className="about-stats">
                                <div className="about-stat">
                                    <span className="about-stat-value">10K+</span>
                                    <span className="about-stat-label">Active Users</span>
                                </div>
                                <div className="about-stat">
                                    <span className="about-stat-value">500+</span>
                                    <span className="about-stat-label">Communities</span>
                                </div>
                                <div className="about-stat">
                                    <span className="about-stat-value">50K+</span>
                                    <span className="about-stat-label">Discussions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" style={{ flex: 1 }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                        <h2>Why Choose Discussify?</h2>
                        <p style={{ color: 'var(--secondary-500)', maxWidth: '600px', margin: '0 auto' }}>
                            Everything you need to build and grow your community
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card glass-card">
                            <div className="feature-icon">
                                <HiOutlineUserGroup size={28} />
                            </div>
                            <h3 className="feature-title">Create Communities</h3>
                            <p className="feature-desc">
                                Build your own communities based on your interests.
                                Invite others to join and grow together.
                            </p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">
                                <HiOutlineChatAlt2 size={28} />
                            </div>
                            <h3 className="feature-title">Join Discussions</h3>
                            <p className="feature-desc">
                                Browse through various communities and join discussions
                                on topics that interest you.
                            </p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">
                                <HiOutlineShare size={28} />
                            </div>
                            <h3 className="feature-title">Share Resources</h3>
                            <p className="feature-desc">
                                Share articles, videos, and other resources with your
                                community members.
                            </p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">
                                <HiOutlineLightningBolt size={28} />
                            </div>
                            <h3 className="feature-title">Real-time Updates</h3>
                            <p className="feature-desc">
                                Stay up-to-date with real-time notifications and
                                instant updates from your communities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
                <div className="container container-md">
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>Ready to get started?</h2>
                    <p style={{ color: 'var(--secondary-500)', marginBottom: 'var(--space-8)' }}>
                        Join thousands of users who are already using Discussify to connect and collaborate.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create your account →
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Landing;

