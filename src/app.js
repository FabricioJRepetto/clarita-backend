import * as dotenv from 'dotenv'
dotenv.config()
import express, { json, urlencoded } from "express";
import router from "./routes/index.js";
import cors from "cors";
import { allowCors, error404, generalErrorHandler } from './middlewares/index.js';
import morgan from "morgan";
const { CLIENT_URL } = process.env;

const app = express();

const whitelist = {
    origin: ['http://localhost:3000', CLIENT_URL,]
}

//* error de cors solucionado con
//? allow cors (funciona)
//? cors origin con esta sintaxis?
//? o mongo generaba el problema al no tener la IP del back autorizada?

app.use(allowCors())
app.use(cors({
    origin: whitelist
}));
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use("/", router);
app.use('*', error404)
app.use(generalErrorHandler);

export default app