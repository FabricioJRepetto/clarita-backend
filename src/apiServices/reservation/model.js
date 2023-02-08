import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const ReservationSchema = new Schema(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client"
        },
        checkin: String,
        checkout: String,
        nights: Number,
        cabin: {
            type: Schema.Types.ObjectId,
            ref: "Cabin"
        },
        persons: Number,
        paymentType: { type: String },
        amount: { type: Number },
        notes: String
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
        strictPopulate: false
    }
);

export default model("Reservation", ReservationSchema);