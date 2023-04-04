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
            trim: true,
            index: {
                unique: true,
                partialFilterExpression: { dni: { $type: "string" } }
            }
        },
        cuil: {
            type: String,
            trim: true,
            index: {
                unique: true,
                partialFilterExpression: { cuil: { $type: "string" } }
            }
        },
        email: {
            type: String,
            trim: true,
            index: {
                unique: true,
                partialFilterExpression: { email: { $type: "string" } }
            }
        },
        company: {
            type: Boolean,
            default: false
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
        notes: { type: String },
        creator: { type: String }
    },
    {
        versionKey: false,
        timestamps: true,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);
// refresh?

export default model("Client", ClientSchema);