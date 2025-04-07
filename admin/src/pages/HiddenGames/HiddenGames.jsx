import { useState, useEffect } from 'react';
import * as RequestUtil from '../../utils/RequestUtil';

const HiddenGames = () => {
  const [data, setData] = useState({ lists: {}, activeList: null, allGames: [] });
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);

  const fetchData = async () => {
    try {
      const result = await RequestUtil.get('/hidden');
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await RequestUtil.post('/hidden/lists', { name: newListName });
      setNewListName('');
      fetchData();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (name) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      await RequestUtil.del(`/hidden/lists/${name}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const setActiveList = async (name) => {
    try {
      await RequestUtil.put('/hidden/active', { name });
      fetchData();
    } catch (error) {
      console.error('Error setting active list:', error);
    }
  };

  const toggleGame = async (gameId) => {
    if (!selectedList) return;

    try {
      await RequestUtil.post(`/hidden/toggle/${selectedList}/${gameId}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling game:', error);
    }
  };

  const isGameHidden = (gameId) => {
    return selectedList && data.lists[selectedList]?.includes(gameId);
  };

  return (
    <div className="hidden-games">
      <div className="section-header">
        <h2>Hidden Games</h2>
      </div>

      <div className="lists-section">
        <div className="list-management">
          <form onSubmit={createList} className="create-list-form">
            <div className="form-header">Create New List</div>
            <div className="input-group">
              <input
                type="text"
                className="input"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
              />
              <button type="submit" className="button create">
                <span className="button-icon">+</span>
                Create
              </button>
            </div>
          </form>

          <div className="lists-container">
            <div className="lists-header">
              <h3>Your Lists</h3>
              {data.activeList && (
                <div className="active-badge">
                  Active: {data.activeList}
                </div>
              )}
            </div>

            <div className="lists">
              {/* Default list card */}
              <div 
                className={`list-card default ${selectedList === 'Default' ? 'selected' : ''} ${data.activeList === 'Default' ? 'active' : ''}`}
                onClick={() => setSelectedList('Default')}
              >
                <div className="list-info">
                  <div className="list-title">Default List</div>
                  <div className="list-subtitle">Shows all games</div>
                </div>
                <div className="list-actions">
                  <button
                    className={`button-icon ${data.activeList === 'Default' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveList('Default');
                    }}
                  >
                    {data.activeList === 'Default' ? '★' : '☆'}
                  </button>
                </div>
              </div>

              {/* Custom lists */}
              {Object.keys(data.lists)
                .filter(listName => listName !== 'Default')
                .map(listName => (
                <div 
                  key={listName}
                  className={`list-card ${selectedList === listName ? 'selected' : ''} ${data.activeList === listName ? 'active' : ''}`}
                  onClick={() => setSelectedList(listName)}
                >
                  <div className="list-info">
                    <div className="list-title">{listName}</div>
                    <div className="list-subtitle">
                      {data.lists[listName].length} hidden games
                    </div>
                  </div>
                  <div className="list-actions">
                    <button
                      className={`button-icon ${data.activeList === listName ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveList(listName === data.activeList ? 'Default' : listName);
                      }}
                    >
                      {data.activeList === listName ? '★' : '☆'}
                    </button>
                    <button
                      className="button-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(listName);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="games-section">
          {selectedList ? (
            <>
              <h3>
                {selectedList === 'Default' ? 'All Games' : `Games in ${selectedList}`}
                {selectedList === 'Default' && (
                  <div className="default-note">This list shows all games and cannot be modified</div>
                )}
              </h3>
              <div className="games-grid">
                {data.allGames.map(game => (
                  <div
                    key={game.id}
                    className={`game-card ${isGameHidden(game.id) ? 'hidden' : ''} ${selectedList === 'Default' ? 'default-list' : ''}`}
                    onClick={() => selectedList !== 'Default' && toggleGame(game.id)}
                  >
                    <img src={game.thumbnail} alt={game.title} className="game-thumbnail" />
                    <div className="game-info">
                      <span className="game-title">{game.title}</span>
                      {selectedList !== 'Default' && (
                        <span className="game-status">
                          {isGameHidden(game.id) ? 'Hidden' : 'Visible'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>Select a list to manage hidden games</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenGames;