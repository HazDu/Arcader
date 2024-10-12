import fs from "fs";
import https from "https";
import {findCoreByExtension} from "./emulation";

const SERVER_PORT = process.env.ADMIN_UI_PORT || 5328;
const API_KEY = process.env.STEAMGRIDDB_API_KEY;

const downloadFile = (url, path) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path);
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
            fs.unlink(path, () => reject(err));
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

    const path = process.cwd() + `/data/cache/${fileId}.png`;

    try {
        await downloadFile(image, path);
        console.log(`Downloaded image to ${path}`);
    } catch (error) {
        console.error(`Error downloading image: ${error.message}`);
    }

    return `http://localhost:${SERVER_PORT}/image/${fileId}`;
};

export const retrieveGames = () => {
    const gameFiles = fs.readdirSync("./data/roms")
        .filter(file => file.includes("-"));

    return gameFiles.map(file => {
        const [id, title] = file.split("-");
        return {
            id, title: title.replaceAll("_", " ").split(".")[0],
            thumbnail: `http://localhost:${SERVER_PORT}/image/${id}`, extension: file.split(".").pop()
        };
    });
}

export const cacheGameThumbnails = async () => {
    const games = retrieveGames();

    for (const game of games) {
        const console = findCoreByExtension(game.extension);
        const id = await lookupGameId(game.title + " " + console.name);
        await downloadGameImage(id, game.id);
    }
}