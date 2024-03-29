import Cabin from "./model.js";
import Reservation from "../reservation/model.js"
import { dateSort } from "../../utils/sorter.js";

//? update cabin's current reservation
export const updateCabinReservs = async (cabin_id) => {
    const cabin = await Cabin.findById(cabin_id),
        today = new Date(new Date().toLocaleDateString('en'))

    if (!cabin) return { error: 'No cabins with that ID' }

    if (cabin.current_guest) {
        // current_guest es una ID de reserva
        const reservation = await Reservation.findById(cabin.current_guest)
        if (!reservation) {
            cabin.current_guest = null
        } else if (reservation.cabin !== cabin_id) {
            cabin.current_guest = null
        } else {
            // checkear las fechas de la reserva actual
            const checkin = new Date(reservation.checkin),
                checkout = new Date(reservation.checkout)

            // si in es > a hoy o out es < a hoy, eliminar current_guest
            if (checkin > today || checkout < today) {
                cabin.current_guest = null
            }
        }
    }
    if (!!cabin.reservations.length) {
        // checkear todas las reservas buscando una reserva actual
        // si el checkin es <= a hoy && checkout es > a hoy, agregar a current_guest
        const newReservations = []
        for (let i = 0; i < cabin.reservations.length; i++) {
            const r = cabin.reservations[i],
                checkin = new Date(r.in),
                checkout = new Date(r.out)

            // filtrar reservas pasadas
            if (checkout >= today) {
                // checkear que la reserva exista
                const reserv = await Reservation.findById(r.reservation_id)
                if (reserv) {
                    if (checkin <= today && checkout > today) {
                        cabin.current_guest = r.reservation_id
                    }
                    newReservations.push(r)
                }
            }
        }
        cabin.reservations = newReservations.sort(dateSort)
    }

    await cabin.save()

    return { error: false }
}