import { Link } from 'react-router-dom';
import {
    HiOutlineHeart,
    HiOutlineMail,
    HiOutlineGlobeAlt
} from 'react-icons/hi';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaGithub,
    FaDiscord
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook', color: '#1877F2' },
        { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter', color: '#1DA1F2' },
        { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: '#E4405F' },
        { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn', color: '#0A66C2' },
        { icon: FaGithub, href: 'https://github.com', label: 'GitHub', color: '#333' },
        { icon: FaDiscord, href: 'https://discord.com', label: 'Discord', color: '#5865F2' },
    ];

    const footerLinks = [
        {
            title: 'Company',
            links: [
                { label: 'About Us', to: '/about' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
                { label: 'Blog', to: '/blog' },
            ]
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', to: '/help' },
                { label: 'Safety Center', to: '/safety' },
                { label: 'Community Guidelines', to: '/guidelines' },
                { label: 'Contact Us', to: '/contact' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Cookie Policy', to: '/cookies' },
                { label: 'Accessibility', to: '/accessibility' },
            ]
        }
    ];

    return (
        <footer style={{
            background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)',
            color: 'white',
            marginTop: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* Main Footer Content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--space-12) var(--space-6)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-8)'
                }}>
                    {/* Brand Section */}
                    <div>
                        <h3 style={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 700,
                            marginBottom: 'var(--space-4)',
                            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            💬 Discussify
                        </h3>
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            opacity: 0.8,
                            lineHeight: 1.6,
                            marginBottom: 'var(--space-4)'
                        }}>
                            Connect, discuss, and grow with communities that share your passions.
                        </p>

                        {/* Social Links */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-2)',
                            flexWrap: 'wrap'
                        }}>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={social.label}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'all 0.2s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = social.color;
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <social.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Link Columns */}
                    {footerLinks.map((column) => (
                        <div key={column.title}>
                            <h4 style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 'var(--space-4)',
                                opacity: 0.9
                            }}>
                                {column.title}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {column.links.map((link) => (
                                    <li key={link.label} style={{ marginBottom: 'var(--space-2)' }}>
                                        <Link
                                            to={link.to}
                                            style={{
                                                color: 'rgba(255,255,255,0.7)',
                                                textDecoration: 'none',
                                                fontSize: 'var(--font-size-sm)',
                                                transition: 'color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = 'white'}
                                            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: 'var(--space-4) var(--space-6)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)'
                }}>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        opacity: 0.7,
                        margin: 0
                    }}>
                        © {currentYear} Discussify. All rights reserved.
                    </p>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        opacity: 0.7,
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)'
                    }}>
                        Made with <HiOutlineHeart style={{ color: '#ef4444' }} /> for Infosys Springboard
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
