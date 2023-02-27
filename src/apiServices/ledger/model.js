import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const LedgerSchema = new Schema(
    {
        month: { type: Number },
        year: { type: Number },
        entries: [
            {
                date: { type: String },
                entryType: { type: String },
                description: { type: String },
                amount: { type: Number },
                currency: { type: String },
                reservation: {
                    type: Schema.Types.ObjectId,
                    ref: "Reservation"
                },
                creator: { type: String },
                editor: { type: String }
            }
        ]

    },
    {
        versionKey: false,
        timestamps: true,
        toJSON: { getters: true, virtuals: true },
        toObject: { getters: true, virtuals: true },
        strictPopulate: false
    }
)

//: TODO: virtuals
// Ledger.balance
LedgerSchema.virtual("balance").get(function () {
    let balance = {
        income: 0,
        expense: 0,
        total: 0
    };
    this.entries.forEach(m => {
        if (m.currency === 'ARS') {
            if (m.entryType === 'income') {
                balance.income = balance.income + m.amount
            } else {
                balance.expense = balance.expense + m.amount
            }
        }
    });
    balance.total = balance.income - balance.expense
    return balance;
});



export default model("Ledger", LedgerSchema)