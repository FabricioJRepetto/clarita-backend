import Ledger from "../apiServices/ledger/model.js";

export const deleteEntries = async (id) => {
    const ledger = await Ledger.findOneAndUpdate(
        {
            'entries.reservation': id
        },
        {
            "$pull": {
                entries: { reservation: id }
            }
        },
        { new: false }
    )

    const aux = {
        id: ledger?.id,
        date: ledger?.entries.find(e => e.reservation && e.reservation.toString() === id)?.date
    }

    return aux
}