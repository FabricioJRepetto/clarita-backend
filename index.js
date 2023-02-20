import * as dotenv from 'dotenv'
dotenv.config()
import app from "./src/app.js";
import { start } from "./src/microservices/DBConnection.js";
// const PORT = process.env.PORT || 4000;

export const listen = () => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`\x1b[32m✔ \x1b[0m · Server listening on port ${process.env.PORT || 4000}`);
    });
}
console.log(process.env.PORT);
start()