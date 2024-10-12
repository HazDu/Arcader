import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("admin ui");
});

export const startServer = () => {
    app.listen(5328, () => {
        console.log("Server started on http://localhost:5328");
    });
}
