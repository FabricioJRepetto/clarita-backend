import connectDB from "./src/microservices/DBConnection.js";

connectDB()
// connectDB connects first to mongo and then starts the server (startServer.js on /utils)