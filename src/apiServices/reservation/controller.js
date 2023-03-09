import Reservation from "./model.js";
import { addToCabinList, overlapDetector, removeFromCabin, updateCabinList } from "./utils.js";
import mongoose from 'mongoose';
import Cabin from '../cabin/model.js'
import { registerEntry, registerQuickEntry, registerUpdatedEntries } from "../../utils/registerEntry.js";
import { deleteEntries } from "../../utils/deleteEntries.js";

const createReservation = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const {
            client,
            checkin,
            checkout,
            nights,
            cabin,
            persons,
            paymentStatus,
            currency,
            paymentDate,
            paymentType,
            fees,
            mpDetails,
            percentage,
            amount,
            extraPayments,
            total,
            notes
        } = req.body

        if (!client) return res.json({ error: 'No client ID' })
        if (!checkin) return res.json({ error: 'No checkin' })
        if (!checkout) return res.json({ error: 'No checkout' })
        if (!nights) return res.json({ error: 'No nights' })
        if (!cabin) return res.json({ error: 'No cabin' })
        // if (!persons) return res.json({ error: 'No persons' })
        if (!req.body.hasOwnProperty('paymentStatus')) return res.json({ error: 'No payment paymentStatus' })
        if (!currency) return res.json({ error: 'No payment currency' })
        if (!paymentType) return res.json({ error: 'No payment paymentType' })
        if (typeof amount !== 'number') return res.json({ error: 'No payment amount' })
        // if (!notes) return res.json({ error: 'No notes' })

        const { error, reservation_id } = await overlapDetector(cabin, checkin, checkout)
        if (error) return res.json({ error, reservation_id })


        const newReservation = await Reservation.create(
            {
                client,
                checkin,
                checkout,
                nights,
                cabin,
                persons,
                paymentDate,
                paymentStatus,
                currency,
                paymentType,
                fees,
                mpDetails,
                percentage,
                amount,
                extraPayments,
                notes,
                total,
                creator: user_name
            }
        )

        // actualizo reservas de la cabaña
        const updatedCabin = await addToCabinList(cabin, newReservation.id, checkin, checkout)

        //? Registra entrada contable
        await registerEntry(req.body, user_name, newReservation.id)

        const allReservations = await Reservation.find()
            .populate('client')
            .populate('cabin', 'name')

        return res.json({
            message: 'Reserva creada exitosamente.',
            newReservation,
            reservationsList: allReservations,
            updatedCabin
        })

    } catch (error) {
        next(error)
    }
}

const getReservation = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const reservation = await Reservation.findById(id)
            .populate('client')
            .populate('cabin', 'name')
        if (!reservation) return res.json({ error: 'No hay reservas con esa ID.' })

        return res.json({ reservation })
    } catch (error) {
        next(error)
    }
}

const getAllReservations = async (req, res, next) => {
    try {
        const allReservations = await Reservation.find({})
            .populate('client')
            .populate('cabin', 'name')
        return res.json({ reservationList: allReservations })

    } catch (error) {
        next(error)
    }
}

const editReservation = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const { id } = req.query
        const {
            client,
            checkin,
            checkout,
            nights,
            cabin,
            persons,
            paymentStatus,
            paymentDate,
            paymentType,
            currency,
            amount,
            fees,
            mpDetails,
            percentage,
            extraPayments,
            total,
            notes
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!client) return res.json({ error: 'No client ID' })
        if (!checkin) return res.json({ error: 'No checkin' })
        if (!checkout) return res.json({ error: 'No checkout' })
        if (!nights) return res.json({ error: 'No nights' })
        if (!cabin) return res.json({ error: 'No cabin' })
        // if (!persons) return res.json({ error: 'No persons' })
        if (!req.body.hasOwnProperty('paymentStatus')) return res.json({ error: 'No payment paymentStatus' })
        if (!paymentType) return res.json({ error: 'No payment paymentType' })
        if (!amount) return res.json({ error: 'No payment amount' })
        // if (!notes) return res.json({ error: 'No notes' })

        const { error, reservation_id } = await overlapDetector(cabin, checkin, checkout)
        if (error && reservation_id !== id) return res.json({ error })

        await removeFromCabin(cabin, id)

        const newReservation = await Reservation.findByIdAndUpdate(
            id,
            {
                $set: {
                    client: mongoose.Types.ObjectId(client),
                    checkin,
                    checkout,
                    nights,
                    cabin,
                    persons,
                    paymentStatus,
                    paymentDate,
                    paymentType,
                    currency,
                    amount,
                    fees,
                    mpDetails,
                    percentage,
                    extraPayments,
                    notes,
                    total,
                    editor: user_name
                }
            },
            { new: true }
        )

        const updatedCabin = await addToCabinList(cabin, newReservation.id, checkin, checkout)

        //: eliminar entries anteriores...
        //: y guardar ID del ledger
        await deleteEntries(id)

        //: agregar las entries actualizadas
        await registerUpdatedEntries(req.body, id, user_name)

        const allReservations = await Reservation.find({})
            .populate('client')
            .populate('cabin', 'name')

        return res.json({
            message: 'Reserva actualizada exitosamente.',
            newReservation,
            reservationsList: allReservations,
            updatedCabin
        })

    } catch (error) {
        next(error)
    }
}

const deleteReservation = async (req, res, next) => {
    try {
        const { id, remove } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const existingID = await Reservation.findById(id)
        if (!existingID) return res.json({ error: 'No hay reservas con esa ID.' })

        const { cabin } = await Reservation.findByIdAndDelete(id)
        // update cabin reservations
        const cabinExists = await Cabin.findById(cabin)
        // cabin = cabin ID, id = reservation ID
        if (cabinExists) await removeFromCabin(cabin, id)

        //: Remove ledger entries
        if (remove === 'true') {
            await deleteEntries(id)
        }

        const allReservations = await Reservation.find({})
        return res.json({ message: 'Reserva eliminada.', reservationList: allReservations })

    } catch (error) {
        next(error)
    }
}

const quickPayment = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const { id } = req.query
        const {
            paymentDate,
            paymentStatus,
            paymentType,
            amount,
            currency,
            fees,
            mpDetails,
            percentage
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!req.body.hasOwnProperty('paymentStatus')) return res.json({ error: 'No payment paymentStatus' })
        if (!paymentType) return res.json({ error: 'No payment paymentType' })
        if (!amount) return res.json({ error: 'No payment amount' })

        const reserv = await Reservation.findById(id)
        if (!reserv) return res.json({ error: 'No hay reservas con esa ID.' })

        const extra_id = !!reserv?.extraPayments?.length ? 'extra' + (reserv?.extraPayments?.length + 1) : 'extra1',
            data = {
                id: extra_id,
                paymentDate,
                paymentType,
                currency,
                amount,
                fees,
                mpDetails,
                percentage,
            }

        if (reserv?.extraPayments) {
            reserv.extraPayments = [...reserv.extraPayments, data]
        } else {
            reserv.extraPayments = [data]
        }

        if (paymentStatus) {
            reserv.paymentStatus = true
        }

        await reserv.save()

        const entryData = {
            client: reserv.client,
            paymentDate,
            paymentType,
            checkin: new Date().toLocaleDateString('en'),
            currency,
            amount
        }

        await registerQuickEntry(entryData, user_name, id)

        const reservationsList = await Reservation.find({})
            .populate('client')
            .populate('cabin', 'name')

        return res.json({ message: 'Pagos de la reserva actualizados.', reserv, reservationsList })

    } catch (err) {
        next(err)
    }
}

export {
    getReservation,
    getAllReservations,
    createReservation,
    editReservation,
    deleteReservation,
    quickPayment
}