import {useState, useEffect} from 'react';
import * as RequestUtil from '../../utils/RequestUtil';
import './CoinScreen.sass';

const CoinScreen = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [config, setConfig] = useState({
        insertMessage: '',
        infoMessage: '',
        konamiCodeEnabled: false
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const response = await RequestUtil.get('/config/coinScreen');

                if (response.success && response.config) {
                    setConfig(response.config);
                }

                setError(null);
            } catch (err) {
                setError('Failed to load coin screen configuration');
                console.error('Error loading config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            const response = await RequestUtil.post('/config/coinScreen', config);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError('Failed to save configuration');
            console.error('Error saving config:', err);
            setTimeout(() => setError(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const {name, value, checked, type} = e.target;
        setConfig({
            ...config,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="coin-screen-page">
            <div className="section-header">
                <h2>Coin Screen Configuration</h2>
            </div>

            <div className="config-container">
                {loading ? (
                    <div className="loading-indicator">Loading configuration...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="config-form">
                        <div className="form-header">
                            <h3>Customize your Insert Coin Screen</h3>
                        </div>

                        {error && (
                            <div className="alert error">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert success">
                                <i className="fas fa-check-circle"></i>
                                <span>Configuration saved successfully!</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="insertMessage">Insert Message</label>
                            <input
                                type="text"
                                id="insertMessage"
                                name="insertMessage"
                                value={config.insertMessage}
                                onChange={handleChange}
                                className="input"
                                placeholder="INSERT COIN"
                            />
                            <span className="form-help">The main message displayed on the coin screen (default: INSERT COIN)</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="infoMessage">Info Message</label>
                            <textarea
                                id="infoMessage"
                                name="infoMessage"
                                value={config.infoMessage}
                                onChange={handleChange}
                                className="input textarea"
                                placeholder="Insert Coin to enter Game Library and choose a Game to play!"
                                rows={2}
                            ></textarea>
                            <span className="form-help">The informational text shown below the main message</span>
                        </div>

                        <div className="form-group checkbox-group">
                            <div className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    id="konamiCodeEnabled"
                                    name="konamiCodeEnabled"
                                    checked={config.konamiCodeEnabled}
                                    onChange={handleChange}
                                    className="checkbox-input"
                                />
                                <label htmlFor="konamiCodeEnabled" className="checkbox-label">
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">Enable Konami Code Cheat</span>
                                </label>
                            </div>
                            <span className="form-help">
                If enabled, the Konami code (↑↑↓↓←→←→BA) will bypass coin insertion
              </span>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="button primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CoinScreen;