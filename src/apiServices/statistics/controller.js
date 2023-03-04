import Reservation from '../reservation/model.js'
import Ledger from '../ledger/model.js'
import { nextMonth } from '../../utils/formatDate.js'

const test = async (req, res, next) => {
    try {
        const { date } = req.query,
            limit = nextMonth(date)

        // const numReserv = await Reservation.find({
        //     createdAt: { $gte: date, $lt: limit }
        // })

        const bookings = await Reservation.aggregate([
            {
                $group: {
                    _id: {
                        month: {
                            $month: '$createdAt'
                        },
                        year: {
                            $year: '$createdAt'
                        }
                    },
                    numberOfBookings: { $sum: 1 },

                }
            }
        ])
        const hostings = await Reservation.aggregate([
            {
                $group: {
                    _id: {
                        month: {
                            $month: {
                                $dateFromString: {
                                    dateString: '$checkin'
                                }
                            }
                        },
                        year: {
                            $year: {
                                $dateFromString: {
                                    dateString: '$checkin'
                                }
                            }
                        }
                    },
                    numberOfReservs: { $sum: 1 },
                    numberOfGuests: { $sum: '$persons' }
                }
            }
        ])
        const income = await Ledger.aggregate([
            { $unwind: "$entries" },
            {
                $group: {
                    _id: {
                        month: "$month",
                        year: "$year",
                    },
                    totalIncome: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        "$entries.reservation",
                                        { "$eq": ["$entries.currency", "ARS"] },
                                    ]
                                },
                                "$entries.amount",
                                0
                            ],
                        }
                    }
                }
            }
        ])

        const averageBookings = bookings.reduce(
            (total, curr) => total + curr.numberOfBookings, 0
        ) / bookings.length

        const averageHostings = hostings.reduce(
            (total, curr) => total + curr.numberOfReservs, 0
        ) / hostings.length

        const aux = {
            bookings,
            averageBookings,
            hostings,
            averageHostings,
            income
        }



        res.json({ aux })
    } catch (err) {
        next(err)
    }
}

export {
    test
}

/*    
    _Gráfico de ingresos Mensuales/Diarios: 
            Ledger: total 
        _Ingresos en monedas extrangeras

    *Reservas registradas este Mes: 
            Reservation: createdAt
        *Promedio de Reservas Mensuales

    *Hospedajes este Mes: 
            Reservation: checkin
        *Total de Huespedes este Mes: 
                Reservation: persons
        _Total generado por reservas: 
                Ledger: entries con ID de reserva
        *Promedio de Hospedajes Mensuales
*/