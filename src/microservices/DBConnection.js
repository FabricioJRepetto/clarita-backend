import mongoose from "mongoose";
const { DB_URL } = process.env;
import { listen } from "../../index.js"

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
    listen()
}

export const start = async () => {
    try {
        mongoose.connect(DB_URL, options, conCB);
    } catch (err) {
        console.log("\x1b[31m❌\x1b[0m · No CB error: MongoDB NOT connected")
        console.log(err)
        listen()
    }
}