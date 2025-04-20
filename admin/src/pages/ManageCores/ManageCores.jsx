import React, {useState, useEffect} from 'react';
import * as RequestUtil from '../../utils/RequestUtil';

export const ManageCores = () => {
    const [cores, setCores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [statusDetails, setStatusDetails] = useState('');
    const [coreForm, setCoreForm] = useState({
        name: '',
        extensions: '',
        coreFile: null
    });

    const fetchCores = async () => {
        setLoading(true);
        try {
            const response = await RequestUtil.get('/cores');
            if (response.cores) {
                setCores(response.cores);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load cores');
            console.error('Error fetching cores:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCores();
    }, []);

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setCoreForm(prev => ({...prev, [name]: value}));
    };

    const handleFileChange = (e) => {
        setCoreForm(prev => ({...prev, coreFile: e.target.files[0]}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!coreForm.name || !coreForm.extensions) {
            setError('Please fill in all required fields');
            return;
        }

        setUploading(true);
        setMessage(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('name', coreForm.name);
            formData.append('extensions', coreForm.extensions);

            if (coreForm.coreFile) {
                formData.append('coreFile', coreForm.coreFile);
            } else {
                setError('Please select a core file');
                setUploading(false);
                return;
            }

            await RequestUtil.post('/cores', formData, true);

            setMessage('Core added successfully');
            setCoreForm({
                name: '',
                extensions: '',
                coreFile: null
            });

            // Reset file input
            document.getElementById('coreFile').value = '';

            fetchCores();
        } catch (err) {
            setError('Failed to add core');
            console.error('Error adding core:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCore = async (coreName) => {
        if (!window.confirm(`Are you sure you want to delete the core "${coreName}"?`)) {
            return;
        }

        try {
            await RequestUtil.del(`/cores/${coreName}`);
            setMessage('Core deleted successfully');
            fetchCores();
        } catch (err) {
            setError('Failed to delete core');
            console.error('Error deleting core:', err);
        }
    };

    const handleRestoreDefaults = async () => {
        if (!window.confirm('Are you sure you want to restore default cores? This will download all cores from the internet and may take some time.')) {
            return;
        }

        setRestoring(true);
        setMessage('Starting core restoration process...');
        setStatusDetails('Downloading core files from RetroArch buildbot...');
        setError(null);

        try {
            await RequestUtil.post('/cores/restore-defaults');
            setMessage('Restore process started. This may take several minutes to complete.');
            setStatusDetails('Installing core files. Please wait...');

            // Poll for changes every 5 seconds for up to 2 minutes
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                try {
                    await fetchCores();

                    // Check if we have cores installed
                    const installedCount = cores.filter(core => core.fileExists).length;
                    if (installedCount > 0) {
                        setStatusDetails(`${installedCount} cores have been installed`);
                    }

                    // After some time, assume the process is complete
                    if (attempts >= 12) { // 1 minute (12 * 5s)
                        clearInterval(interval);
                        setRestoring(false);
                        setMessage('Default cores restored successfully');
                        setStatusDetails('');
                    }
                } catch (err) {
                    console.error('Error checking cores status:', err);
                }
            }, 5000);

        } catch (err) {
            setError('Failed to restore default cores');
            setStatusDetails('');
            console.error('Error restoring default cores:', err);
            setRestoring(false);
        }
    };

    const getMissingCount = () => {
        return cores.filter(core => !core.fileExists).length;
    };

    const getInstalledCount = () => {
        return cores.filter(core => core.fileExists).length;
    };

    return (
        <div className="manage-cores">
            <div className="section-header">
                <div>
                    <h2>Manage Cores</h2>
                    <p className="section-description">
                        Manage RetroArch cores used for game emulation
                    </p>
                </div>
                <div className="action-buttons">
                    <button
                        className="button"
                        onClick={handleRestoreDefaults}
                        disabled={restoring}
                    >
                        {restoring ? 'Restoring...' : 'Restore Defaults'}
                    </button>
                </div>
            </div>

            {message && (
                <div className="message success">
                    <div>{message}</div>
                    {statusDetails && <div className="status-details">{statusDetails}</div>}
                </div>
            )}

            {error && (
                <div className="message error">{error}</div>
            )}

            {!loading && cores.length > 0 && (
                <div className="cores-summary">
                    <div className="summary-item">
                        <span className="label">Total Cores:</span>
                        <span className="value">{cores.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Installed:</span>
                        <span className="value">{getInstalledCount()}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Missing:</span>
                        <span className="value">{getMissingCount()}</span>
                    </div>
                </div>
            )}

            <div className="content-section">
                <div className="upload-section">
                    <form onSubmit={handleSubmit}>
                        <h3>Add New Core</h3>

                        <div className="form-group">
                            <label htmlFor="name">Console Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={coreForm.name}
                                onChange={handleFormChange}
                                className="edit-input"
                                placeholder="e.g. PlayStation 2"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="extensions">File Extensions (comma separated)</label>
                            <input
                                type="text"
                                id="extensions"
                                name="extensions"
                                value={coreForm.extensions}
                                onChange={handleFormChange}
                                className="edit-input"
                                placeholder="e.g. iso,bin,cue"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="coreFile">Core File</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="coreFile"
                                    name="coreFile"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    required
                                />
                            </div>
                            <small>Upload a RetroArch core file (*.so)</small>
                        </div>

                        <button
                            type="submit"
                            className="button"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Core'}
                        </button>
                    </form>
                </div>

                <div className="list-section">
                    <h3>Installed Cores</h3>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : cores.length === 0 ? (
                        <p>No cores found. Use the form above to add cores or click "Restore Defaults" to download
                            standard cores.</p>
                    ) : (
                        <table className="rom-table cores-table">
                            <thead>
                            <tr>
                                <th>Status</th>
                                <th>Core Name</th>
                                <th>Console Name</th>
                                <th>Extensions</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cores.map((core, index) => (
                                <tr key={index} className={!core.fileExists ? 'missing-core' : ''}>
                                    <td>
                                        {core.fileExists ? (
                                            <span className="status installed">Installed</span>
                                        ) : (
                                            <span className="status missing">Missing File</span>
                                        )}
                                    </td>
                                    <td>{core.core}</td>
                                    <td>{core.name}</td>
                                    <td>
                                        <div className="extensions-list">
                                            {core.extensions.map((ext, i) => (
                                                <span key={i} className="extension-tag">{ext}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="button delete"
                                            onClick={() => handleDeleteCore(core.core)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};