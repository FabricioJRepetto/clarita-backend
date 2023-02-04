import Cabin from "./model.js";
import Reservation from "../reservation/model.js"

//? update cabin's current reservation
export const updateCabinGuest = async (cabin_id) => {
    const cabin = await Cabin.findById(cabin_id)
    if (!cabin) return { error: 'No cabins with that ID' }

    if (cabin.current_guest) {
        // current_guest es una ID de reserva
        // checkear las fechas de la reserva
        // si out es < a hoy, eliminar current_guest
        const reservation = await Reservation.findById(cabin.current_guest)
        if (!reservation) {
            cabin.current_guest = null
        } else {
            const checkout = new Date(reservation.checkout),
                today = new Date(new Date().toLocaleDateString('en'))

            if (checkout < today) {
                cabin.current_guest = null
            }
        }
    }
    if (!!cabin.reservations.length) {
        // checkear todas las reservas
        // si el checkout de una reserva es < a hoy, eliminarla
        // si el checkin es <= a hoy && checkout es > a hoy, agregar a current_guest
        const newReservations = []
        for (let i = 0; i < cabin.reservations.length; i++) {
            const r = cabin.reservations[i],
                checkin = new Date(r.in),
                checkout = new Date(r.out),
                today = new Date(new Date().toLocaleDateString('en'))

            if (checkout > today) {
                newReservations.push(r)
            }
            if (checkin <= today && checkout > today) {
                cabin.current_guest = r.reservation_id
            }
        }
        cabin.reservations = newReservations
    }

    await cabin.save()

    return { error: false }
}