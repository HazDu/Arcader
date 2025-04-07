import fs from 'fs';

export const ensureDirectories = () => {
    const dirs = ['./data/roms', './data/cache'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

export const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

export const renameFile = (oldPath, newPath) => {
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        return true;
    }
    return false;
};