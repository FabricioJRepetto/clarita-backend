import Reservation from '../reservation/model.js'
import Ledger from '../ledger/model.js'
import { nextMonth } from '../../utils/formatDate.js'

const test = async (req, res, next) => {
    try {
        // const { month, year } = req.query

        // if (!month) return res.json({ error: 'No month' })
        // if (!year) return res.json({ error: 'No year' })

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
                    totalBookings: { $sum: 1 },

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
                    totalHostings: { $sum: 1 },
                    totalGuests: { $sum: '$persons' }
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
                    reservsIncome: {
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
                    },
                    totalIncome: {
                        $sum: {
                            $cond: [
                                {
                                    "$eq": ["$entries.currency", "ARS"]
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
            (total, curr) => total + curr.totalBookings, 0
        ) / bookings.length

        const averageHostings = hostings.reduce(
            (total, curr) => total + curr.totalHostings, 0
        ) / hostings.length

        const averageReservIncome = income.reduce(
            (total, curr) => total + curr.reservsIncome, 0
        ) / income.length

        const averageIncome = income.reduce(
            (total, curr) => total + curr.totalIncome, 0
        ) / income.length

        const aux = {
            bookings,
            averageBookings,
            hostings,
            averageHostings,
            income,
            averageReservIncome,
            averageIncome
        }

        res.json(aux)
    } catch (err) {
        next(err)
    }
}

const getMonth = async (req, res, next) => {
    try {
        const { month, year } = req.query

        if (!month) return res.json({ error: 'No month' })
        if (!year) return res.json({ error: 'No year' })

        const ledger = await Ledger.findOne({ month, year })

        const aux1 = ledger.entries.map(e => ({ date: e.date, ammount: `${e.amount} ${e.currency}` }))
        console.log(aux1);

        if (ledger?.entries) {
            const days = new Array(new Date(year, month + 1, 0).getDate()).fill({})
            ledger.entries.forEach(e => {
                if (e.date && e.currency === 'ARS') {
                    const index = new Date(e.date).getDate() - 1
                    days[index][e.entryType]
                        ? days[index][e.entryType] += e.amount
                        : days[index] = { ...days[index], [e.entryType]: e.amount }
                }
            })

            const dailyBalance = days.map(e => ({
                income: e?.income || 0,
                expense: e?.expense || 0,
                total: (e?.income || 0) - (e?.expense || 0)
            }))
            // console.log(ledger.entries);

            return res.json({ dailyBalance, balance: ledger.balance })
        } else {
            return res.json([])
        }

    } catch (err) {
        next(err)
    }
}

export {
    test,
    getMonth
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
        *Total generado por reservas: 
                Ledger: entries con ID de reserva
        *Promedio de Hospedajes Mensuales
*/