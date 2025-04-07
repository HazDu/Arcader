import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const MainLayout = ({children}) => {
    const [customizationOpen, setCustomizationOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {logout} = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="logo">
                    <h1>Arcader</h1>
                </div>

                <nav>
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        Manage ROMs
                    </Link>
                    <Link to="/hidden" className={`nav-item ${isActive('/hidden') ? 'active' : ''}`}>
                        Hidden Games
                    </Link>
                    <Link to="/single-mode" className={`nav-item ${isActive('/single-mode') ? 'active' : ''}`}>
                        Single Mode
                    </Link>
                    <Link to="/coin-acceptor" className={`nav-item ${isActive('/coin-acceptor') ? 'active' : ''}`}>
                        Coin Acceptor
                    </Link>

                    <div className={`nav-item ${customizationOpen ? 'active' : ''}`}
                         onClick={() => setCustomizationOpen(!customizationOpen)}
                         style={{cursor: 'pointer'}}>
                        Customization
                    </div>

                    {customizationOpen && (
                        <div className="sub-menu">
                            <Link to="/customization/coin"
                                  className={`nav-item ${isActive('/customization/coin') ? 'active' : ''}`}>
                                Coin Screen
                            </Link>
                            <Link to="/customization/splash"
                                  className={`nav-item ${isActive('/customization/splash') ? 'active' : ''}`}>
                                Splash
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;