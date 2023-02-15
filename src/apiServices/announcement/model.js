import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const AnnouncementSchema = new Schema(
    {
        messages: [
            {
                title: { type: String },
                text: { type: String },
                style: { type: String },
                from: { type: String }
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

export default model("Announcement", AnnouncementSchema);