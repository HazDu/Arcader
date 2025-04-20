import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import {reloadCores} from '../../utils/emulation';
import {createWriteStream} from 'fs';
import {promisify} from 'util';
import https from 'https';
import Seven from 'node-7z';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);

const router = express.Router();
const CORES_DIR = path.join(process.cwd(), 'data/cores');
const METADATA_PATH = path.join(CORES_DIR, 'metadata.json');
const DEFAULT_METADATA_PATH = path.join(process.cwd(), 'src/main/default_cores_metadata.json');
const TEMP_DIR = path.join(CORES_DIR, 'temp');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, CORES_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({storage});

const readCoreMetadata = () => {
    try {
        if (fs.existsSync(METADATA_PATH)) {
            return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading core metadata:', error);
    }
    return {cores: []};
};

const getDefaultMetadata = async () => {
    try {
        if (fs.existsSync(DEFAULT_METADATA_PATH)) {
            return JSON.parse(await readFile(DEFAULT_METADATA_PATH, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading default core metadata:', error);
    }
    return {cores: []};
};

const writeCoreMetadata = (data) => {
    try {
        fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing core metadata:', error);
        return false;
    }
};

const downloadFile = async (url, filePath) => {
    const fileStream = createWriteStream(filePath);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download, status code: ${response.statusCode}`));
                return;
            }

            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', err => {
                fs.unlink(filePath, () => {
                });
                reject(err);
            });
        }).on('error', err => {
            fs.unlink(filePath, () => {
            });
            reject(err);
        });
    });
};

const findSoFiles = async (dir) => {
    let results = [];

    try {
        const list = await readdir(dir, {withFileTypes: true});

        for (const item of list) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                const subResults = await findSoFiles(fullPath);
                results = [...results, ...subResults];
            } else if (item.name.endsWith('.so')) {
                results.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error searching directory ${dir}:`, error);
    }

    return results;
};

const cleanTempDir = async () => {
    try {
        if (await exists(TEMP_DIR)) {
            const files = await readdir(TEMP_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_DIR, file);
                const fileStat = await stat(filePath);

                if (fileStat.isDirectory()) {
                    await Promise.all((await readdir(filePath)).map(async (subFile) => {
                        await unlink(path.join(filePath, subFile)).catch(() => {
                        });
                    }));
                    await rmdir(filePath).catch(() => {
                    });
                } else {
                    await unlink(filePath).catch(() => {
                    });
                }
            }
            await rmdir(TEMP_DIR).catch(() => {
            });
        }
    } catch (error) {
        console.error('Error cleaning up temp directory:', error);
    }
};

router.get('/', (req, res) => {
    try {
        const metadata = readCoreMetadata();
        const coresWithFileInfo = metadata.cores.map(core => ({
            ...core,
            fileExists: fs.existsSync(path.join(CORES_DIR, core.core))
        }));

        res.json({cores: coresWithFileInfo});
    } catch (error) {
        console.error('Error getting cores:', error);
        res.status(500).json({error: 'Failed to get cores'});
    }
});

router.post('/', upload.single('coreFile'), (req, res) => {
    try {
        const {name, extensions} = req.body;
        const coreFileName = req.file ? req.file.filename : req.body.coreName;

        if (!coreFileName || !name) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const extensionsArray = extensions ? extensions.split(',').map(ext => ext.trim()) : [];
        const metadata = readCoreMetadata();
        const existingCoreIndex = metadata.cores.findIndex(c => c.core === coreFileName);
        const coreData = {core: coreFileName, name, extensions: extensionsArray};

        if (existingCoreIndex !== -1) {
            metadata.cores[existingCoreIndex] = coreData;
        } else {
            metadata.cores.push(coreData);
        }

        if (writeCoreMetadata(metadata)) {
            reloadCores();
            res.json({success: true, core: coreData});
        } else {
            res.status(500).json({error: 'Failed to save core metadata'});
        }
    } catch (error) {
        console.error('Error adding core:', error);
        res.status(500).json({error: 'Failed to add core'});
    }
});

router.delete('/:coreName', (req, res) => {
    try {
        const {coreName} = req.params;
        const metadata = readCoreMetadata();
        const coreIndex = metadata.cores.findIndex(c => c.core === coreName);

        if (coreIndex === -1) {
            return res.status(404).json({error: 'Core not found'});
        }

        metadata.cores.splice(coreIndex, 1);

        try {
            const corePath = path.join(CORES_DIR, coreName);
            if (fs.existsSync(corePath)) {
                fs.unlinkSync(corePath);
            }
        } catch (fileError) {
            console.error('Error deleting core file:', fileError);
        }

        if (writeCoreMetadata(metadata)) {
            reloadCores();
            res.json({success: true});
        } else {
            res.status(500).json({error: 'Failed to update core metadata'});
        }
    } catch (error) {
        console.error('Error deleting core:', error);
        res.status(500).json({error: 'Failed to delete core'});
    }
});

router.post('/restore-defaults', async (req, res) => {
    try {
        res.json({success: true, message: 'Restore defaults process started'});

        if (!await exists(TEMP_DIR)) {
            await mkdir(TEMP_DIR, {recursive: true});
        }

        const downloadUrl = 'https://buildbot.libretro.com/stable/1.20.0/linux/x86_64/RetroArch_cores.7z';
        const archivePath = path.join(TEMP_DIR, 'RetroArch_cores.7z');
        const extractDir = path.join(TEMP_DIR, 'extracted');

        await mkdir(extractDir, {recursive: true});

        console.log('Downloading RetroArch cores...');
        await downloadFile(downloadUrl, archivePath);

        console.log('Extracting cores...');
        const extractStream = Seven.extractFull(archivePath, extractDir, {$progress: true});
        await new Promise((resolve, reject) => {
            extractStream.on('end', resolve);
            extractStream.on('error', reject);
        });

        console.log('Looking for core files...');
        const soFiles = await findSoFiles(extractDir);

        let copiedCores = 0;
        for (const soFile of soFiles) {
            const fileName = path.basename(soFile);
            const destPath = path.join(CORES_DIR, fileName);

            try {
                await copyFile(soFile, destPath);
                console.log(`Copied ${fileName}`);
                copiedCores++;
            } catch (error) {
                console.error(`Failed to copy ${fileName}:`, error);
            }
        }

        console.log(`Successfully copied ${copiedCores} cores`);

        const defaultMetadata = await getDefaultMetadata();
        await writeFile(METADATA_PATH, JSON.stringify(defaultMetadata, null, 2));

        await cleanTempDir();

        reloadCores();
        console.log('Restore defaults completed successfully');
    } catch (error) {
        console.error('Error restoring default cores:', error);
    }
});

export default router;