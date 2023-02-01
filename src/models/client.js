import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const ClientSchema = new Schema(
    {
        name: String,
        dni: Number,
        age: Number,
        telephone: Number,
        origin: String,
        vehicle: String,
        notes: String
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

export default model("Client", ClientSchema);