import Ledger from "./model.js"
import Reservation from "../reservation/model.js";
import { defineWeek } from "../../utils/defineWeek.js";
import { getWeekValues } from "../../utils/getWeekValues.js";

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

const getWeek = async (req, res, next) => {
    try {
        const { date } = req.query

        if (!date) return res.json({ error: 'No date' })

        const DATE = new Date(date).toLocaleDateString('en')
        // defino las fechas de inicio y final de la semana actual
        // Lunes como primer día
        const {
            start,
            end
        } = defineWeek(DATE)

        const START_MONTH = new Date(start).getMonth()
        const END_MONTH = new Date(end).getMonth()
        if (typeof START_MONTH !== 'number') return res.json({ error: 'Invalid date' })

        // si los meses de inicio y final son el mismo...
        if (START_MONTH === END_MONTH) {
            const YEAR = new Date(start).getFullYear()

            const ledger = await Ledger.findOne({
                month: START_MONTH,
                year: YEAR
            })

            if (!ledger || ledger.entries.length < 1) return res.json({ week: [] })

            const week = getWeekValues(start, end, ledger.entries)

            return res.json({ week })
        } else {
            // si los meses de inicio y final son diferentes...
            // utilizar años de cada fecha
            const START_YEAR = new Date(start).getFullYear()
            const END_YEAR = new Date(end).getFullYear()

            // buscar ambos documentos
            const firstLedger = await Ledger.findOne({
                month: START_MONTH,
                year: START_YEAR
            })
            const secondLedger = await Ledger.findOne({
                month: END_MONTH,
                year: END_YEAR
            })

            // buscar dias de la semana en ambos documentos
            const firstWeek = firstLedger ? getWeekValues(start, end, firstLedger?.entries) : {}
            const secondWeek = secondLedger ? getWeekValues(start, end, secondLedger?.entries) : {}
            const week = { ...firstWeek, ...secondWeek }

            return res.json({ week })
        }

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
            paymentType,
            amount,
            currency,
            reservation
        } = req.body

        if (!date) return res.json({ error: 'No date' })
        if (!entryType) return res.json({ error: 'No entryType' })
        if (!description) return res.json({ error: 'No description' })
        if (!paymentType) return res.json({ error: 'No paymentType' })
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
        const { user_name } = req.user
        const {
            id,
            date,
            entryType,
            description,
            paymentType,
            amount,
            currency,
            reservation
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!date) return res.json({ error: 'No date' })
        if (!entryType) return res.json({ error: 'No entryType' })
        if (!description) return res.json({ error: 'No description' })
        if (!paymentType) return res.json({ error: 'No paymentType' })
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

        const ledger = await Ledger.findOneAndUpdate(
            {
                month: MONTH,
                year: YEAR,
                'entries._id': id
            },
            {
                $set: {
                    'entries.$': {
                        date,
                        entryType,
                        description,
                        paymentType,
                        amount,
                        currency,
                        reservation,
                        editor: user_name
                    }
                }
            },
            { new: true }
        )

        if (!ledger) return res.json({ error: 'Posiblemente ID de entrada incorrecta.' })

        return res.json({
            message: 'Entrada actualizada correctamente.',
            ledger
        })
    } catch (err) {
        next(err)
    }
}

const deleteEntry = async (req, res, next) => {
    try {
        const { date, entry_id } = req.query

        if (!date) return res.json({ error: 'No date' })
        if (!entry_id) return res.json({ error: 'No entry_id' })

        const MONTH = new Date(date).getMonth()
        const YEAR = new Date(date).getFullYear()
        if (typeof MONTH !== 'number' || typeof YEAR !== 'number') return res.json({ error: 'Invalid date' })

        const newLedger = await Ledger.findOneAndUpdate(
            {
                month: MONTH,
                year: YEAR
            },
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
    getWeek,
    getMonth,
    getYear,
    newEntry,
    updateEntry,
    deleteEntry
}