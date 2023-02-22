import Reservation from "./model.js";
import { overlapDetector, removeFromCabin, updateCabin } from "./utils.js";
import mongoose from 'mongoose';
import Cabin from '../cabin/model.js'

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
            paymentType,
            fees,
            mpDetails,
            percentage,
            amount,
            extraPayments,
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
        if (!amount) return res.json({ error: 'No payment amount' })
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
                paymentStatus,
                currency,
                paymentType,
                fees,
                mpDetails,
                percentage,
                amount,
                extraPayments,
                notes,
                creator: user_name
            }
        )

        // actualizo reservas de la cabaña
        const updatedCabin = await updateCabin(cabin, newReservation.id, checkin, checkout)

        const allReservations = await Reservation.find()
            .populate('client')
            .populate('cabin', 'name')

        return res.json({
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
            paymentType,
            amount,
            fees,
            mpDetails,
            percentage,
            extraPayments,
            notes
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!client) return res.json({ error: 'No client ID' })
        if (!checkin) return res.json({ error: 'No checkin' })
        if (!checkout) return res.json({ error: 'No checkout' })
        if (!nights) return res.json({ error: 'No nights' })
        if (!cabin) return res.json({ error: 'No cabin' })
        // if (!persons) return res.json({ error: 'No persons' })
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
                    paymentType,
                    amount,
                    fees,
                    mpDetails,
                    percentage,
                    extraPayments,
                    notes,
                    creator: user_name
                }
            },
            { new: true }
        )

        const updatedCabin = await updateCabin(cabin, newReservation.id, checkin, checkout)

        const allReservations = await Reservation.find({})
            .populate('client')
            .populate('cabin', 'name')
        return res.json({
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
        const { id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const existingID = await Reservation.findById(id)
        if (!existingID) return res.json({ error: 'No hay reservas con esa ID.' })

        const { cabin } = await Reservation.findOneAndDelete(id)
        // update cabin reservations
        const cabinExists = await Cabin.findById(cabin)
        // cabin = cabin ID, id = reservation ID
        if (cabinExists) await removeFromCabin(cabin, id)

        const allReservations = await Reservation.find({})
        return res.json({ message: 'Reserva eliminada.', reservationList: allReservations })

    } catch (error) {
        next(error)
    }
}

export {
    getReservation,
    getAllReservations,
    createReservation,
    editReservation,
    deleteReservation
}