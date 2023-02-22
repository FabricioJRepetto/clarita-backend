import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const ClientSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        dni: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            trim: true,
            index: {
                unique: true,
                partialFilterExpression: { email: { $type: "string" } }
            }
        },
        age: { type: Number },
        telephone: { type: String },
        profession: { type: String },
        civil_status: { type: String },
        address: { type: String },
        nationality: { type: String },
        country_code: { type: String },
        provenance: { type: String },
        plate: { type: String },
        vehicleType: { type: String },
        notes: { type: String }
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

export default model("Client", ClientSchema);