import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const MainLayout = ({children}) => {
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
                    <Link to="/cores" className={`nav-item ${isActive('/cores') ? 'active' : ''}`}>
                        Manage Cores
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

                    <Link to="/customization/coin" 
                          className={`nav-item ${isActive('/customization/coin') || isActive('/customization/splash') ? 'active' : ''}`}>
                        Customization
                    </Link>

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

                    <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                        System Settings
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item">
                        Logout
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