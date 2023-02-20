import app from "./src/app.js";
import { start } from "./src/microservices/DBConnection.js";
const { PORT } = process.env;

export const listen = () => {
    app.listen(PORT || 4000, () => {
        console.log(`\x1b[32m✔ \x1b[0m · Server listening on port ${PORT || 4000}`);
    });
}

start()