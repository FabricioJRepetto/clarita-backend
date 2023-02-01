import * as dotenv from 'dotenv'
dotenv.config()
import express, { json, urlencoded } from "express";
import router from "./routes/index.js";
import cors from "cors";
import allowCors from './allowCors.js';
import morgan from "morgan";
import mongoose from "mongoose";
const { DB_URL, CLIENT_URL } = process.env;

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
        console.log("// Error: MongoDB NOT connected")
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
app.use(allowCors())
//? cors origin con esta sintaxis?
app.use(cors({
    origin: whitelist
}));
//? o mongo generaba el problema al no tener la IP del back autorizada?

app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

app.use("/", mongoConn);

app.use("/", router);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use((err, req, res, next) => {
    //! VOLVER
    // ver como manjear lso status de error en el front
    // para que no quede esperando una respuesta infinitamente
    const status = err.status || 500
    const message = err.message || err
    console.error(err)
    return res.status(status).json({ error: message })
});

export default app