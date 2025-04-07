import {Router} from "express";
import fs from "fs";
import path from "path";

const imageRouter = Router();

const retrieveImage = (key) => {
    const imagePath = path.join(process.cwd(), 'data', 'cache', key);
    const extensions = ["png", "jpg", "jpeg"];

    for (const extension of extensions) {
        const fullPath = `${imagePath}.${extension}`;
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }

    return null;
}

const loadImage = (key, res) => {
    const imagePath = retrieveImage(key);

    if (imagePath) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send('Image not found');
    }
}

imageRouter.get("/:file", (req, res) => {
    const key = req.params.file;
    loadImage(key, res);
});

export default imageRouter;