import { useState, useEffect } from 'react';
import * as RequestUtil from '../../utils/RequestUtil';

const HiddenGames = () => {
  const [data, setData] = useState({ lists: {}, activeList: null, allGames: [] });
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const isGameShown = (gameId) => {
    return selectedList && data.lists[selectedList]?.includes(gameId);
  };

  const filteredGames = data.allGames.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hidden-games">
      <div className="section-header">
        <h2>Game Lists</h2>
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
              <button type="submit" className="button-icon create">
                <i className="fas fa-plus-circle"></i>
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
              <div 
                className={`list-card default ${selectedList === 'All Games' ? 'selected' : ''} ${data.activeList === 'All Games' ? 'active' : ''}`}
                onClick={() => setSelectedList('All Games')}
              >
                <div className="list-info">
                  <div className="list-title">All Games ({data.allGames.length})</div>
                </div>
                <div className="list-actions">
                  <button
                    className={`button-icon checkbox ${data.activeList === 'All Games' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveList('All Games');
                    }}
                  >
                    <i className={`fas ${data.activeList === 'All Games' ? 'fa-check-square' : 'fa-square'}`}></i>
                  </button>
                </div>
              </div>

              {Object.keys(data.lists)
                .filter(listName => listName !== 'All Games')
                .map(listName => (
                <div 
                  key={listName}
                  className={`list-card ${selectedList === listName ? 'selected' : ''} ${data.activeList === listName ? 'active' : ''}`}
                  onClick={() => setSelectedList(listName)}
                >
                  <div className="list-info">
                    <div className="list-title">{listName} ({data.lists[listName].length})</div>
                  </div>
                  <div className="list-actions">
                    <button
                      className="button-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(listName);
                      }}
                      title="Delete list"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                    <button
                      className={`button-icon checkbox ${data.activeList === listName ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveList(listName === data.activeList ? 'All Games' : listName);
                      }}
                      title="Set as active list"
                    >
                      <i className={`fas ${data.activeList === listName ? 'fa-check-square' : 'fa-square'}`}></i>
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
              <div className="games-header">
                <h3>
                  {selectedList === 'All Games' ? 'All Games' : `Games in ${selectedList}`}
                </h3>
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {selectedList === 'All Games' && (
                <div className="default-note">This list shows all games and cannot be modified</div>
              )}
              <div className="games-grid">
                {filteredGames.map(game => (
                  <div
                    key={game.id}
                    className={`game-card ${isGameShown(game.id) ? 'shown' : ''} ${selectedList === 'All Games' ? 'default-list' : ''}`}
                    onClick={() => selectedList !== 'All Games' && toggleGame(game.id)}
                  >
                    <div className="game-info">
                      <span className="game-title">{game.title}</span>
                      {selectedList !== 'All Games' && (
                        <span className="game-status">
                          {isGameShown(game.id) ? 'Shown' : 'Hidden'}
                        </span>
                      )}
                    </div>
                    <img src={game.thumbnail.replace("http://localhost:5328", "")} alt={game.title} className="game-thumbnail" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>Select a list to manage games</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenGames;