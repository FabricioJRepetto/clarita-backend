import mongoose from "mongoose";
const { DB_URL } = process.env;
import startServer from "../utils/startServer.js";

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

export const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect(DB_URL, options);
    } catch (err) {
        console.log("\x1b[31m❌\x1b[0m · MongoDB NOT connected")
        console.log(err);
        startServer()
    }
}

mongoose.connection.on("connected", () => {
    console.log("\x1b[32m✔ \x1b[0m · MongoDB connected")
    startServer();
});

mongoose.connection.on("error", (error) => {
    console.log(`\x1b[31m❌\x1b[0m · Mongoose default connection has occured: ${error}`);
    process.exit();
});

mongoose.connection.on("disconnected", () => {
    console.log("\x1b[31m❌\x1b[0m · MongoDB disconnected");
});

process.on("uncaughtException", () => {
    mongoose.disconnect();
});

const closeConnection = function () {
    mongoose.connection.close(() => {
        console.log("\x1b[31m❌\x1b[0m · MongoDB disconnected due to app termination");
        process.exit(0);
    });
};

process.on("SIGINT", closeConnection).on("SIGTERM", closeConnection);

export default connectDB;