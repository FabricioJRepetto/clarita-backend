import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const ClientSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        dni: {
            type: Number,
            required: true,
            unique: true,
        },
        age: Number,
        telephone: Number,
        profession: String,
        civil_status: String,
        origin: {
            address: { type: String },
            nationality: { type: String },
            provenance: { type: String },
        },
        vehicle: {
            plate: { type: String },
            vehicleType: { type: String },
        },
        notes: String
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

export default model("Client", ClientSchema);