import fs from "fs";
import https from "https";
import path from "path";
import {findCoreByExtension} from "./emulation";
import { loadHiddenGames, getVisibleGames } from "./hiddenGames";

const SERVER_PORT = process.env.ADMIN_UI_PORT || 5328;
const API_KEY = process.env.STEAMGRIDDB_API_KEY;

const getRootPath = () => {
    return process.cwd();
};

const downloadFile = (url, filePath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", (err) => {
            console.error(`Failed to download '${url}': ${err.message}`);
            fs.unlink(filePath, () => reject(err));
        });
    });
};

export const lookupGameId = async (title) => {
    const response = await fetch(`https://www.steamgriddb.com/api/v2/search/autocomplete/${title}`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    });

    const json = await response.json();

    return json.data[0].id;
}

export const downloadGameImage = async (id, fileId) => {
    const response = await fetch(`https://www.steamgriddb.com/api/v2/grids/game/${id}?dimensions=600x900&limit=1`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    });

    const json = await response.json();
    const image = json.data[0].url;

    const imagePath = path.join(getRootPath(), 'data', 'cache', `${fileId}.png`);

    try {
        await downloadFile(image, imagePath);
        console.log(`Downloaded image to ${imagePath}`);
    } catch (error) {
        console.error(`Error downloading image: ${error.message}`);
    }

    return `/api/image/${fileId}`;
};

export const retrieveGames = (filterHidden = true) => {
    const romsPath = path.join(getRootPath(), 'data', 'roms');
    const gameFiles = fs.readdirSync(romsPath)
        .filter(file => file.includes("-"));

    const games = gameFiles.map(file => {
        const [id, title] = file.split("-");
        return {
            id, 
            title: title.replaceAll("_", " ").split(".")[0],
            thumbnail: `/api/image/${id}`, 
            extension: file.split(".").pop()
        };
    });

    return filterHidden ? getVisibleGames(games) : games;
}

export const getNextFreeId = () => {
    const games = retrieveGames();
    const ids = games.map(game => parseInt(game.id));
    const maxId = Math.max(...ids);

    return maxId + 1;
}

export const cacheGameThumbnails = async () => {
    const games = retrieveGames();

    for (const game of games) {
        const console = findCoreByExtension(game.extension);
        const id = await lookupGameId(game.title + " " + console.name);
        await downloadGameImage(id, game.id);
    }
}

export const cacheMissingThumbnails = async () => {
    const games = retrieveGames();

    for (const game of games) {
        const console = findCoreByExtension(game.extension);
        const id = await lookupGameId(game.title + " " + console.name);

        if (!fs.existsSync(path.join(getRootPath(), 'data', 'cache', `${game.id}.png`))) {
            await downloadGameImage(id, game.id);
        }
    }
}