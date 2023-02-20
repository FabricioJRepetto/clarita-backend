import app from "../app.js";

const PORT = process.env.PORT || 4000;

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`\x1b[32m✔ \x1b[0m · Server listening on port ${PORT}`);
    });
}

export default startServer