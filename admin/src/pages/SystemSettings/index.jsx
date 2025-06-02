import {useState, useEffect} from 'react';
import * as RequestUtil from '../../utils/RequestUtil';
import './SystemSettings.sass';

const SystemSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [config, setConfig] = useState({
        enableJoystick: false,
        disableCoinSlot: false,
        coinAcceptorPath: '/dev/ttyACM0',
        joystickIndex: 0,
        adminUiPort: 5328,
        steamGridDbApiKey: null
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const response = await RequestUtil.get('/config/systemSettings');

                if (response.success && response.config) {
                    setConfig(response.config);
                }

                setError(null);
            } catch (err) {
                setError('Failed to load system settings');
                console.error('Error loading system settings:', err);
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
            const response = await RequestUtil.post('/config/systemSettings', config);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError('Failed to save system settings');
            console.error('Error saving system settings:', err);
            setTimeout(() => setError(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const {name, value, checked, type} = e.target;
        
        // Special case for numeric inputs to ensure they are stored as numbers
        if (name === 'joystickIndex' || name === 'adminUiPort') {
            setConfig({
                ...config,
                [name]: type === 'checkbox' ? checked : Number(value)
            });
        } else {
            setConfig({
                ...config,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    return (
        <div className="system-settings-page">
            <div className="section-header">
                <h2>System Settings</h2>
            </div>

            <div className="config-container">
                {loading ? (
                    <div className="loading-indicator">Loading system settings...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="config-form">
                        <div className="form-header">
                            <h3>Configure System Settings</h3>
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
                                <span>Settings saved successfully! Restart the application to apply changes.</span>
                            </div>
                        )}
                        
                        <div className="settings-group">
                            <h4>Input Settings</h4>
                            
                            <div className="form-group checkbox-group">
                                <div className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        id="enableJoystick"
                                        name="enableJoystick"
                                        checked={config.enableJoystick}
                                        onChange={handleChange}
                                        className="checkbox-input"
                                    />
                                    <label htmlFor="enableJoystick" className="checkbox-label">
                                        <span className="checkbox-custom"></span>
                                        <span className="checkbox-text">Enable Joystick Support</span>
                                    </label>
                                </div>
                                <span className="form-help">
                                    Enable joystick support during development
                                </span>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="joystickIndex">Joystick Index</label>
                                <input
                                    type="number"
                                    id="joystickIndex"
                                    name="joystickIndex"
                                    value={config.joystickIndex}
                                    onChange={handleChange}
                                    className="input"
                                    min="0"
                                />
                                <span className="form-help">ID of the primary joystick (default: 0)</span>
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <div className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        id="disableCoinSlot"
                                        name="disableCoinSlot"
                                        checked={config.disableCoinSlot}
                                        onChange={handleChange}
                                        className="checkbox-input"
                                    />
                                    <label htmlFor="disableCoinSlot" className="checkbox-label">
                                        <span className="checkbox-custom"></span>
                                        <span className="checkbox-text">Disable Coin Slot</span>
                                    </label>
                                </div>
                                <span className="form-help">
                                    Disable coin slot functionality
                                </span>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="coinAcceptorPath">Coin Acceptor Path</label>
                                <input
                                    type="text"
                                    id="coinAcceptorPath"
                                    name="coinAcceptorPath"
                                    value={config.coinAcceptorPath}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="/dev/ttyACM0"
                                />
                                <span className="form-help">Path to the coin acceptor device (default: /dev/ttyACM0)</span>
                            </div>
                        </div>
                        
                        <div className="settings-group">
                            <h4>API Settings</h4>
                            
                            <div className="form-group">
                                <label htmlFor="adminUiPort">Admin UI Port</label>
                                <input
                                    type="number"
                                    id="adminUiPort"
                                    name="adminUiPort"
                                    value={config.adminUiPort}
                                    onChange={handleChange}
                                    className="input"
                                    min="1024"
                                    max="65535"
                                />
                                <span className="form-help">Port for the admin UI (default: 5328)</span>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="steamGridDbApiKey">SteamGridDB API Key</label>
                                <input
                                    type="text"
                                    id="steamGridDbApiKey"
                                    name="steamGridDbApiKey"
                                    value={config.steamGridDbApiKey || ''}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter your API key"
                                />
                                <span className="form-help">API key for SteamGridDB to fetch game images</span>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="button"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SystemSettings;
