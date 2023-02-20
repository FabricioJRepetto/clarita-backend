import app from "./src/app.js";
// import { start } from "./src/microservices/DBConnection.js";
const PORT = process.env.PORT || 4000;

import mongoose from "mongoose";
const { DB_URL } = process.env;

mongoose.set('strictQuery', false);
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};
const conCB = (err) => {
    if (err) {
        console.log(`\x1b[31m❌\x1b[0m · MongoDB NOT connected. Error: ${err.codeName} ${err.code}`)
    } else {
        console.log("\x1b[32m✔ \x1b[0m · MongoDB connected")
    }
    app.listen(PORT, () => {
        console.log(`\x1b[32m✔ \x1b[0m · Server listening on port ${PORT}`);
    });
}

mongoose.connect(DB_URL, options, conCB);


// export const listen = () => {
// }
// console.log(process.env.PORT);
// start()