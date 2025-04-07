import fs from 'fs';
import path from 'path';

const SHOWN_GAMES_FILE = path.join(process.cwd(), 'data', 'shown-games.json');
const DEFAULT_DATA = {
    lists: {
        'All Games': []
    },
    activeList: 'All Games'
};

const ensureFile = () => {
    if (!fs.existsSync(SHOWN_GAMES_FILE)) {
        fs.writeFileSync(SHOWN_GAMES_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    } else {
        const data = JSON.parse(fs.readFileSync(SHOWN_GAMES_FILE, 'utf8'));
        if (!data.lists['All Games']) {
            data.lists['All Games'] = [];
            if (!data.activeList) {
                data.activeList = 'All Games';
            }
            fs.writeFileSync(SHOWN_GAMES_FILE, JSON.stringify(data, null, 2));
        }
    }
};

export const loadShownGames = () => {
    ensureFile();
    const data = fs.readFileSync(SHOWN_GAMES_FILE, 'utf8');
    return JSON.parse(data);
};

const saveShownGames = (data) => {
    if (!data.lists['All Games']) {
        data.lists['All Games'] = [];
    }
    fs.writeFileSync(SHOWN_GAMES_FILE, JSON.stringify(data, null, 2));
};

export const createList = (listName) => {
    if (listName === 'All Games') {
        throw new Error('Cannot create a list named All Games');
    }
    const data = loadShownGames();
    if (data.lists[listName]) {
        throw new Error('List already exists');
    }
    data.lists[listName] = [];
    saveShownGames(data);
    return data;
};

export const deleteList = (listName) => {
    if (listName === 'All Games') {
        throw new Error('Cannot delete the All Games list');
    }
    const data = loadShownGames();
    if (!data.lists[listName]) {
        throw new Error('List does not exist');
    }
    delete data.lists[listName];
    if (data.activeList === listName) {
        data.activeList = 'All Games';
    }
    saveShownGames(data);
    return data;
};

export const setActiveList = (listName) => {
    const data = loadShownGames();
    if (listName === null) {
        data.activeList = 'All Games';
    } else if (!data.lists[listName]) {
        throw new Error('List does not exist');
    } else {
        data.activeList = listName;
    }
    saveShownGames(data);
    return data;
};

export const toggleGameShown = (listName, gameId) => {
    if (listName === 'All Games') {
        throw new Error('Cannot modify the All Games list');
    }
    const data = loadShownGames();
    if (!data.lists[listName]) {
        throw new Error('List does not exist');
    }
    
    const index = data.lists[listName].indexOf(gameId);
    if (index === -1) {
        data.lists[listName].push(gameId);
    } else {
        data.lists[listName].splice(index, 1);
    }
    
    saveShownGames(data);
    return data;
};

export const getVisibleGames = (allGames) => {
    const data = loadShownGames();
    if (!data.activeList || data.activeList === 'All Games' || !data.lists[data.activeList]) {
        return allGames;
    }
    
    const shownIds = data.lists[data.activeList];
    return allGames.filter(game => shownIds.includes(game.id));
};