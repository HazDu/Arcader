import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { deleteFile, renameFile } from '../../utils/fileSystem';
import { getNextFreeId, downloadGameImage, lookupGameId, retrieveGames } from '../../utils/loader';
import { findCoreByExtension, getAllConsoles } from '../../utils/emulation';

const romRouter = Router();
const storage = multer.diskStorage({
    destination: path.join(process.cwd(), 'data', 'roms'),
    filename: (req, file, cb) => {
        const id = getNextFreeId();
        const gameName = file.originalname.replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, '_');
        const ext = path.extname(file.originalname);
        cb(null, `${id}-${gameName}${ext}`);
    }
});

const upload = multer({ storage });

romRouter.get('/', (req, res) => {
    try {
        console.log('Fetching games from:', path.join(process.cwd(), 'data', 'roms'));
        const games = retrieveGames();
        console.log('Retrieved games:', games);
        res.json(games);
    } catch (error) {
        console.error('Error in GET /roms:', error);
        res.status(500).json({ error: error.message });
    }
});

romRouter.post('/upload', upload.single('rom'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const gameId = req.file.filename.split('-')[0];
    const gameName = req.file.filename.split('-')[1].split('.')[0].replace(/_/g, ' ');
    const extension = path.extname(req.file.filename).substring(1);
    
    try {
        const console = findCoreByExtension(extension);
        if (!console) {
            throw new Error('Unsupported ROM format');
        }
        const steamGridDbId = await lookupGameId(gameName + " " + console.name);
        await downloadGameImage(steamGridDbId, gameId);
        
        res.json({ 
            success: true, 
            file: req.file.filename,
            id: gameId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

romRouter.delete('/:id', (req, res) => {
    const id = req.params.id;
    const romFiles = fs.readdirSync(path.join(process.cwd(), 'data', 'roms'));
    const romFile = romFiles.find(file => file.startsWith(id + '-'));
    
    if (!romFile) {
        return res.status(404).json({ error: 'ROM not found' });
    }

    const romPath = path.join(process.cwd(), 'data', 'roms', romFile);
    const cachePath = path.join(process.cwd(), 'data', 'cache', `${id}.png`);

    try {
        deleteFile(romPath);
        deleteFile(cachePath);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

romRouter.put('/:id/rename', (req, res) => {
    const id = req.params.id;
    const { newName } = req.body;
    
    if (!newName) {
        return res.status(400).json({ error: 'New name not provided' });
    }

    const romFiles = fs.readdirSync(path.join(process.cwd(), 'data', 'roms'));
    const romFile = romFiles.find(file => file.startsWith(id + '-'));
    
    if (!romFile) {
        return res.status(404).json({ error: 'ROM not found' });
    }

    const ext = path.extname(romFile);
    const formattedName = newName.replace(/[^a-zA-Z0-9]/g, '_');
    const oldPath = path.join(process.cwd(), 'data', 'roms', romFile);
    const newPath = path.join(process.cwd(), 'data', 'roms', `${id}-${formattedName}${ext}`);

    try {
        renameFile(oldPath, newPath);
        res.json({ 
            success: true,
            newFilename: `${id}-${formattedName}${ext}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

romRouter.get('/consoles', (req, res) => {
    try {
        const consoles = getAllConsoles();
        res.json(consoles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default romRouter;