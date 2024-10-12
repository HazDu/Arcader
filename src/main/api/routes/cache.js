import {Router} from "express";
import fs from "fs";

const imageRouter = Router();

const retrieveImage = (key) => {
    const path = process.cwd() + `/data/cache/${key}`;
    const extensions = ["png", "jpg", "jpeg"];

    for (const extension of extensions) {
        if (fs.existsSync(`${path}.${extension}`)) {
            return `${path}.${extension}`;
        }
    }

    return null;
}

const loadImage = (key, res) => {
    const path = retrieveImage(key);

    if (path) {
        res.sendFile(path);
    }
}

imageRouter.get("/*", (req, res) => {
    const url = req.url;
    const key = url.substring(1);

    loadImage(key, res);
});

export default imageRouter;