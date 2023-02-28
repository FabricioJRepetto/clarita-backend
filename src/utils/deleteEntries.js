import Ledger from "../apiServices/ledger/model.js";

export const deleteEntries = async (id) => {
    await Ledger.findOneAndUpdate({
        'entries.reservation': id
    },
        {
            "$pull": {
                entries: { reservation: id }
            }
        }
    )
    return
}