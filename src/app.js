import * as dotenv from 'dotenv'
dotenv.config()
import express, { json, urlencoded } from "express";
import router from "./routes/index.js";
import cors from "cors";
import { allowCors, error404, generalErrorHandler } from './middlewares/index.js';
import morgan from "morgan";
const { CLIENT_URL } = process.env;

import mongoose from "mongoose";
const { DB_URL } = process.env;

const app = express();

const whitelist = {
    origin: ['http://localhost:3000', CLIENT_URL,]
}

//? Mongo
mongoose.set('strictQuery', false);
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};
let mongoConnected = null;
const mongoConn = async (req, res, next) => {
    try {
        if (mongoConnected) return mongoConnected

        return mongoose.connect(DB_URL, options, (err) => {
            if (err) console.log(err)
            else {
                mongoConnected = true
                console.log("// MongoDB connected")
            }
        });
    } catch (err) {
        console.log("// MongoDB NOT connected")
        console.log(err)
    } finally {
        mongoConnected
            ? next()
            : setTimeout(() => {
                next()
            }, 2000)
    }
}

//* error de cors solucionado con
//? allow cors (funciona)
//? cors origin con esta sintaxis?
//? o mongo generaba el problema al no tener la IP del back autorizada?

app.use(allowCors())
app.use(cors({
    origin: whitelist
}));

app.use("/", mongoConn);

app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use("/", router);
app.use('*', error404)
app.use(generalErrorHandler);

export default app