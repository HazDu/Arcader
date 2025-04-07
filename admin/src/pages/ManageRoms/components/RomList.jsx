import {useEffect, useState} from 'react';
import * as RequestUtil from '../../../utils/RequestUtil.js';

const RomList = ({refresh, searchQuery, onSearch}) => {
    const [roms, setRoms] = useState([]);
    const [consoles, setConsoles] = useState([]);
    const [selectedConsole, setSelectedConsole] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoms();
        fetchConsoles();
    }, [refresh]);

    const fetchConsoles = async () => {
        try {
            const data = await RequestUtil.get('/roms/consoles');
            setConsoles(data);
        } catch (error) {
            console.error('Error fetching consoles:', error);
        }
    };

    const fetchRoms = async () => {
        try {
            const data = await RequestUtil.get('/roms');
            setRoms(data);
        } catch (error) {
            console.error('Error fetching ROMs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ROM?')) return;

        try {
            await RequestUtil.del(`/roms/${id}`);
            fetchRoms();
        } catch (error) {
            console.error('Error deleting ROM:', error);
        }
    };

    const handleEdit = (rom) => {
        setEditingId(rom.id);
        setEditName(rom.title.replace(/_/g, ' '));
    };

    const handleSave = async () => {
        try {
            await RequestUtil.put(`/roms/${editingId}/rename`, {newName: editName});
            setEditingId(null);
            fetchRoms();
        } catch (error) {
            console.error('Error updating ROM:', error);
        }
    };

    const findCoreByExtension = (ext) => {
        return consoles.find(c => c.extensions.includes(ext));
    };

    const filteredRoms = roms
        .filter(rom => {
            const matchesSearch = searchQuery ?
                rom.title.toLowerCase().includes(searchQuery.toLowerCase()) :
                true;
            const matchesConsole = selectedConsole ?
                findCoreByExtension(rom.extension)?.name === selectedConsole :
                true;
            return matchesSearch && matchesConsole;
        });

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"/>
            </div>
        );
    }

    return (
        <div className="rom-list-container">
            <div className="filters">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search ROMs..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                <select
                    value={selectedConsole}
                    onChange={(e) => setSelectedConsole(e.target.value)}
                    className="console-filter"
                >
                    <option value="">All Consoles</option>
                    {consoles.map(console => (
                        <option key={console.name} value={console.name}>
                            {console.name}
                        </option>
                    ))}
                </select>
            </div>

            <table className="rom-table">
                <thead>
                <tr>
                    <th></th>
                    <th>Game Info</th>
                    <th>Console</th>
                    <th className="actions-column">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredRoms.map((rom) => {
                    const console = findCoreByExtension(rom.extension);
                    return (
                        <tr key={rom.id}>
                            <td className="thumbnail-cell">
                                <img
                                    src={rom.thumbnail.replace("http://localhost:5328", "")}
                                    alt={rom.title}
                                    className="rom-thumbnail"
                                />
                            </td>
                            <td className="game-info-cell">
                                <div className="game-info">
                                    {editingId === rom.id ? (
                                        <div className="game-name-edit">
                                            <input
                                                type="text"
                                                className="edit-input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                            />
                                            <span className="extension">.{rom.extension}</span>
                                        </div>
                                    ) : (
                                        <div className="game-title">
                                            <span className="name">{rom.title.replace(/_/g, ' ')}</span>
                                            <span className="extension">.{rom.extension}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="console-cell">
                                <div className="console-info">
                                    <span className="console-name">{console?.name || 'Unknown'}</span>
                                </div>
                            </td>
                            <td className="actions-cell">
                                {editingId === rom.id ? (
                                    <>
                                        <button onClick={handleSave} className="button">
                                            Save
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="button">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(rom)} className="button">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rom.id)}
                                            className="button delete"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default RomList;