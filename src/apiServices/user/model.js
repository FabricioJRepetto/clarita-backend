import { Schema as _Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const Schema = _Schema;

const UserSchema = new Schema(
    {
        user_name: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        approved: {
            type: Boolean,
            required: true,
            default: false
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        role: { type: String }
    },
    {
        versionKey: false,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
    }
);

UserSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    const compare = await bcrypt.compare(candidatePassword, user.password);
    return compare;
};

export default model("User", UserSchema);