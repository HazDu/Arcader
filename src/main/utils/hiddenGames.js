import fs from 'fs';
import path from 'path';

const HIDDEN_GAMES_FILE = path.join(process.cwd(), 'data', 'hidden-games.json');
const DEFAULT_DATA = {
    lists: {
        'Default': [] // Default list that shows all games
    },
    activeList: 'Default'
};

// Ensure the hidden games file exists
const ensureFile = () => {
    if (!fs.existsSync(HIDDEN_GAMES_FILE)) {
        fs.writeFileSync(HIDDEN_GAMES_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    } else {
        // Ensure Default list exists in existing file
        const data = JSON.parse(fs.readFileSync(HIDDEN_GAMES_FILE, 'utf8'));
        if (!data.lists.Default) {
            data.lists.Default = [];
            if (!data.activeList) {
                data.activeList = 'Default';
            }
            fs.writeFileSync(HIDDEN_GAMES_FILE, JSON.stringify(data, null, 2));
        }
    }
};

// Load hidden games data
export const loadHiddenGames = () => {
    ensureFile();
    const data = fs.readFileSync(HIDDEN_GAMES_FILE, 'utf8');
    return JSON.parse(data);
};

// Save hidden games data
const saveHiddenGames = (data) => {
    // Ensure Default list is never removed
    if (!data.lists.Default) {
        data.lists.Default = [];
    }
    fs.writeFileSync(HIDDEN_GAMES_FILE, JSON.stringify(data, null, 2));
};

// Create a new list
export const createList = (listName) => {
    if (listName === 'Default') {
        throw new Error('Cannot create a list named Default');
    }
    const data = loadHiddenGames();
    if (data.lists[listName]) {
        throw new Error('List already exists');
    }
    data.lists[listName] = [];
    saveHiddenGames(data);
    return data;
};

// Delete a list
export const deleteList = (listName) => {
    if (listName === 'Default') {
        throw new Error('Cannot delete the Default list');
    }
    const data = loadHiddenGames();
    if (!data.lists[listName]) {
        throw new Error('List does not exist');
    }
    delete data.lists[listName];
    if (data.activeList === listName) {
        data.activeList = 'Default';
    }
    saveHiddenGames(data);
    return data;
};

// Set active list
export const setActiveList = (listName) => {
    const data = loadHiddenGames();
    if (listName === null) {
        data.activeList = 'Default';
    } else if (!data.lists[listName]) {
        throw new Error('List does not exist');
    } else {
        data.activeList = listName;
    }
    saveHiddenGames(data);
    return data;
};

// Toggle game hidden status in a list
export const toggleGameHidden = (listName, gameId) => {
    if (listName === 'Default') {
        throw new Error('Cannot modify the Default list');
    }
    const data = loadHiddenGames();
    if (!data.lists[listName]) {
        throw new Error('List does not exist');
    }
    
    const index = data.lists[listName].indexOf(gameId);
    if (index === -1) {
        data.lists[listName].push(gameId);
    } else {
        data.lists[listName].splice(index, 1);
    }
    
    saveHiddenGames(data);
    return data;
};

// Get visible games based on active list
export const getVisibleGames = (allGames) => {
    const data = loadHiddenGames();
    if (!data.activeList || data.activeList === 'Default' || !data.lists[data.activeList]) {
        return allGames;
    }
    
    const hiddenIds = data.lists[data.activeList];
    return allGames.filter(game => !hiddenIds.includes(game.id));
};