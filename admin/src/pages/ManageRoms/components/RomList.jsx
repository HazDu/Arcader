import { useState, useEffect } from 'react';
import * as RequestUtil from '../../../utils/RequestUtil.js';

const RomList = ({ refresh, searchQuery }) => {
  const [roms, setRoms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoms();
  }, [refresh]);

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
      await RequestUtil.put(`/roms/${editingId}/rename`, { newName: editName });
      setEditingId(null);
      fetchRoms();
    } catch (error) {
      console.error('Error updating ROM:', error);
    }
  };

  const filteredRoms = searchQuery
    ? roms.filter(rom => rom.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : roms;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="rom-list-container">
      <table className="rom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Thumbnail</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoms.map((rom) => (
            <tr key={rom.id}>
              <td>{rom.id}</td>
              <td>
                {editingId === rom.id ? (
                  <input
                    type="text"
                    className="edit-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                ) : (
                  rom.title.replace(/_/g, ' ')
                )}
              </td>
              <td>
                <img 
                  src={rom.thumbnail} 
                  alt={rom.title} 
                  className="rom-thumbnail"
                />
              </td>
              <td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RomList;