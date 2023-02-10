import Reservation from "./model.js";
import { overlapDetector, removeFromCabin, updateCabin } from "./utils.js";
import mongoose from 'mongoose';
import Cabin from '../cabin/model.js'

/*
import Cabin from "../cabin/model.js";
import { doDatesOverlap } from "../../utils/doDatesOverlap.js";

const overlapDetector = async (cabin, checkin, checkout) => {
    try {
        const cabinExists = await Cabin.findById(cabin)
        if (!cabinExists) return { error: 'Wrong cabin ID' }

        let overlap = cabinExists.reservations.find(r => {
            doDatesOverlap(r.in, r.out, checkin, checkout)
        })
        if (overlap) {
            return {
                error: `Fechas no disponibles. 
                        Fechas requeridas: ${checkin} al ${checkout}. 
                        Reserva ya registrada: ${overlap.in} al ${overlap.out}, id de reserva: ${overlap.reservation_id}`,
                reservation_id: overlap.reservation_id
            }
        } else {
            return { error: false }
        }
    } catch (error) {
        console.log(error)
        return { error }
    }
}

const updateCabin = async (cabin, id, checkin, checkout) => {
    const updateCabin = await Cabin.findById(cabin)
    updateCabin.reservations.push(
        {
            reservation_id: id,
            in: checkin,
            out: checkout
        }
    )
    await updateCabin.save()
    return
}

const removeFromCabin = async (cabin, id) => {
    const targetCabin = await Cabin.findById(cabin)

    targetCabin.reservations = targetCabin.reservations.filter(r => r.reservation_id !== id)
    await targetCabin.save()
    return
}
*/

const createReservation = async (req, res, next) => {
    try {
        const {
            client,
            checkin,
            checkout,
            nights,
            cabin,
            persons,
            paymentType,
            fees,
            percentage,
            amount,
            notes
        } = req.body

        if (!client) return res.json({ error: 'No client ID' })
        if (!checkin) return res.json({ error: 'No checkin' })
        if (!checkout) return res.json({ error: 'No checkout' })
        // if (!nights) return res.json({ error: 'No nights' })
        if (!cabin) return res.json({ error: 'No cabin' })
        // if (!persons) return res.json({ error: 'No persons' })
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
                paymentType,
                fees,
                percentage,
                amount,
                notes
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
            percentage,
            notes
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!client) return res.json({ error: 'No client ID' })
        if (!checkin) return res.json({ error: 'No checkin' })
        if (!checkout) return res.json({ error: 'No checkout' })
        // if (!nights) return res.json({ error: 'No nights' })
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
                    percentage,
                    notes
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