import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div className="layout-with-sidebar" style={{ flex: 1 }}>
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;

