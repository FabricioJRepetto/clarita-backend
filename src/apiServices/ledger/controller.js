import Ledger from "./model.js"
import Reservation from "../reservation/model.js";

const getAll = async (req, res, next) => {
    try {
        const ledger = await Ledger.find({})

        res.json({ ledger: ledger || [] })

    } catch (err) {
        next(err)
    }
}

const getYear = async (req, res, next) => {
    try {
        const { date } = req.query

        if (!date) return res.json({ error: 'No date' })

        const YEAR = new Date(date).getFullYear()
        if (typeof YEAR !== 'number') return res.json({ error: 'Invalid date' })

        const ledger = await Ledger.find({
            year: YEAR
        })

        return res.json({ ledger })

    } catch (err) {
        next(err)
    }
}

const getMonth = async (req, res, next) => {
    try {
        const { date } = req.query

        if (!date) return res.json({ error: 'No date' })

        const MONTH = new Date(date).getMonth()
        const YEAR = new Date(date).getFullYear()
        if (typeof MONTH !== 'number' || typeof YEAR !== 'number') return res.json({ error: 'Invalid date' })

        const ledger = await Ledger.findOne({
            month: MONTH,
            year: YEAR
        })

        return res.json({ ledger })

    } catch (err) {
        next(err)
    }
}

const newEntry = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const {
            date,
            entryType,
            description,
            amount,
            currency,
            reservation
        } = req.body

        if (!date) return res.json({ error: 'No date' })
        if (!entryType) return res.json({ error: 'No entryType' })
        if (!description) return res.json({ error: 'No description' })
        if (!amount) return res.json({ error: 'No amount' })
        if (!currency) return res.json({ error: 'No currency' })

        if (reservation) {
            const reserv = await Reservation.findById(reservation)
            if (!reserv) return res.json({ error: 'No reserv with that ID' })
        }

        // tomar el mes y el año de la fecha
        const MONTH = new Date(date).getMonth()
        const YEAR = new Date(date).getFullYear()
        if (typeof MONTH !== 'number' || typeof YEAR !== 'number') return res.json({ error: 'Invalid date' })

        const ledger = await Ledger.findOne({
            month: MONTH,
            year: YEAR
        })

        if (ledger) {
            ledger.entries.push({ ...req.body, creator: user_name })
            await ledger.save()

            return res.json({
                message: 'Entrada registrada correctamente.',
                ledger
            })
        } else {
            const newLedger = await Ledger.create({
                month: MONTH,
                year: YEAR,
                entries: [{ ...req.body, creator: user_name }]
            })

            return res.json({
                message: 'Entrada registrada correctamente.',
                ledger: newLedger
            })
        }

    } catch (err) {
        next(err)
    }
}

const updateEntry = async (req, res, next) => {
    try {

    } catch (err) {
        next(err)
    }
}

const deleteEntry = async (req, res, next) => {
    try {
        const { ledger_id, entry_id } = req.query

        if (!ledger_id) return res.json({ error: 'No ledger_id' })
        if (!entry_id) return res.json({ error: 'No entry_id' })

        const newLedger = await Ledger.findByIdAndUpdate(
            ledger_id,
            {
                $pull: {
                    entries: { _id: entry_id },
                },
            },
            { new: true }
        );

        return res.json({ message: 'Entrada eliminada.', ledger: newLedger })

    } catch (err) {
        next(err)
    }
}

export {
    getAll,
    getMonth,
    getYear,
    newEntry,
    updateEntry,
    deleteEntry
}