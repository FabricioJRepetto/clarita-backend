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
        paymentStatus: {
            type: Boolean,
            default: true
        },
        currency: { type: String },
        paymentType: { type: String },
        amount: { type: Number },
        fees: { type: String },
        percentage: { type: Number },
        notes: String
    },
    {
        versionKey: false,
        timestamps: true,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
        strictPopulate: false
    }
);

export default model("Reservation", ReservationSchema);