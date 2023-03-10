import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const CabinSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        capacity: {
            type: Number,
            // required: true
        },
        identifier: { type: String },
        enabled: {
            type: Boolean,
            default: true
        },
        icon: { type: String },
        current_guest: {
            type: Schema.Types.ObjectId,
            ref: "Reservation"
        },
        reservations: [
            {
                reservation_id: { type: String },
                in: { type: String },
                out: { type: String }
            }
        ]
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
        strictPopulate: false
    }
);

export default model("Cabin", CabinSchema);