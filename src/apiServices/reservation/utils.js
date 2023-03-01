import Cabin from "../cabin/model.js";
import { doDatesOverlap } from "../../utils/doDatesOverlap.js";

const overlapDetector = async (cabin, checkin, checkout) => {
    try {
        const cabinExists = await Cabin.findById(cabin)
        if (!cabinExists) return { error: 'Wrong cabin ID' }

        let overlap = cabinExists.reservations.find(r =>
            doDatesOverlap(r.in, r.out, checkin, checkout)
        )
        if (overlap) {
            return {
                error: `Fechas no disponibles. Fechas solicitadas en este registro: ${checkin} al ${checkout}. Conflicto con reserva existente: ${overlap.in} al ${overlap.out}, id de reserva: ${overlap.reservation_id}`,
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

//? add to cabin's reservation list
const addToCabinList = async (cabin, id, checkin, checkout) => {
    const updateCabin = await Cabin.findByIdAndUpdate(
        cabin,
        {
            "$push": {
                reservations: {
                    reservation_id: id,
                    in: checkin,
                    out: checkout
                }
            }
        }
    )

    return
}

//? update data on cabin's reservation list
const updateCabinList = async (cabin, id, checkin, checkout) => {

    const aux = await Cabin.findOneAndUpdate(
        {
            "reservations.reservation_id": id
        },
        {
            "$set": {
                "reservations.$": {
                    reservation_id: id,
                    checkin,
                    checkout
                }
            }
        },
        { new: true }
    )

    return
}

//? remove from cabin's reservation list
const removeFromCabin = async (cabin, id) => {
    await Cabin.findByIdAndUpdate(
        cabin,
        {
            "$pull": {
                reservations: {
                    reservation_id: id
                }
            }
        }
    )
    return
}

export {
    overlapDetector,
    addToCabinList,
    updateCabinList,
    removeFromCabin
}