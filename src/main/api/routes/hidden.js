import { Router } from 'express';
import { 
    loadHiddenGames, 
    createList, 
    deleteList, 
    setActiveList, 
    toggleGameHidden,
    getVisibleGames
} from '../../utils/hiddenGames';
import { retrieveGames } from '../../utils/loader';

const hiddenRouter = Router();

hiddenRouter.get('/', (req, res) => {
    try {
        const data = loadHiddenGames();
        const allGames = retrieveGames(false);
        res.json({
            ...data,
            allGames,
            visibleGames: getVisibleGames(allGames)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

hiddenRouter.post('/lists', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'List name is required' });
        }
        const data = createList(name);
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

hiddenRouter.delete('/lists/:name', (req, res) => {
    try {
        const data = deleteList(req.params.name);
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

hiddenRouter.put('/active', (req, res) => {
    try {
        const { name } = req.body;
        const data = setActiveList(name);
        const allGames = retrieveGames(false);
        res.json({
            ...data,
            visibleGames: getVisibleGames(allGames)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

hiddenRouter.post('/toggle/:listName/:gameId', (req, res) => {
    try {
        const { listName, gameId } = req.params;
        const data = toggleGameHidden(listName, gameId);
        const allGames = retrieveGames(false);
        res.json({
            ...data,
            visibleGames: getVisibleGames(allGames)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default hiddenRouter;