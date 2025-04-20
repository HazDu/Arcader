import express from "express";
import imageRouter from "./routes/cache";
import romRouter from "./routes/roms";
import hiddenRouter from "./routes/hidden";
import coresRouter from "./routes/cores";
import configRouter from "./routes/config";
import { ensureDirectories } from "../utils/fileSystem";

const app = express();
const SERVER_PORT = process.env.ADMIN_UI_PORT || 5328;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const ignoreCORS = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
}

const authenticateRequest = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.use(express.json());
app.use(ignoreCORS);

const apiRouter = express.Router();

apiRouter.post("/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

apiRouter.use("/image", imageRouter);

apiRouter.use("/roms", authenticateRequest, romRouter);
apiRouter.use("/hidden", authenticateRequest, hiddenRouter);
apiRouter.use("/cores", authenticateRequest, coresRouter);
apiRouter.use("/config", authenticateRequest, configRouter);

app.use("/api", apiRouter);

app.get("/", (req, res) => {
    res.send("admin ui");
});

export const startServer = () => {
    ensureDirectories();
    app.listen(SERVER_PORT, () => {
        console.log(`Server started on port ${SERVER_PORT}`);
    });
}
