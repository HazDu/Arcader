import {useState} from 'react';
import RomList from './components/RomList.jsx';
import RomUpload from './components/RomUpload.jsx';

export const ManageRoms = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="manage-roms">
            <div className="section-header">
                <h2>Manage ROMs</h2>
                <p className="section-description">Upload and manage your ROM files</p>
            </div>

            <div className="content-section">
                <div className="upload-section">
                    <RomUpload onUploadComplete={handleUploadComplete}/>
                </div>

                <div className="list-section">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search ROMs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <RomList refresh={refreshTrigger} searchQuery={searchQuery}/>
                </div>
            </div>
        </div>
    );
};