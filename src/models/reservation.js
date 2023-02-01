import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const ReservationSchema = new Schema(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client"
        },
        date: String,
        nights: Number,
        cabin: String,
        payment: {
            type: String,
            amount: Number
        },
        notes: String
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

export default model("Reservation", ReservationSchema);