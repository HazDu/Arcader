import express from "express";
import imageRouter from "./routes/cache";

const app = express();
const SERVER_PORT = process.env.ADMIN_UI_PORT || 5328;

const ignoreCORS = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
}

app.use(express.json());
app.use(ignoreCORS);

app.use("/image", imageRouter);

app.get("/", (req, res) => {
    res.send("admin ui");
});

export const startServer = () => {
    app.listen(SERVER_PORT, () => {
        console.log(`Server started on port ${SERVER_PORT}`);
    });
}
