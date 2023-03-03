import Ledger from "../apiServices/ledger/model.js";
import Client from "../apiServices/client/model.js";

export const registerEntry = async (data, creator, reservation) => {
    const {
        client,
        checkin,
        amount,
        currency,
        paymentDate,
        paymentType,
        extraPayments
    } = data

    //? agrego el movimiento a las cuentas
    const today = new Date(new Date().toLocaleDateString('en'))
    if (new Date(checkin) >= today) {
        const clientData = await Client.findById(client)

        const entry = {
            date: paymentDate,
            entryType: 'income',
            description: `Reserva de ${clientData.name} (${clientData.nationality}) -  (${paymentType}) ${!!extraPayments?.length ? 'Pago #1' : ''}`,
            amount,
            currency,
            reservation,
            creator
        }
        // console.log(entry);

        const MONTH = new Date(paymentDate).getMonth()
        const YEAR = new Date(paymentDate).getFullYear()

        const ledger = await Ledger.findOne({
            month: MONTH,
            year: YEAR
        })

        if (ledger) {
            ledger.entries.push(entry)
            await ledger.save()

        } else {
            await Ledger.create({
                month: MONTH,
                year: YEAR,
                entries: [entry]
            })
        }

        if (extraPayments && !!extraPayments?.length) {
            // si hay extras, recorremos
            // si la fecha de ese pago es igual, guardamos
            // si es diferente, buscamos o creamos nuevo doc y guardamos
            for (let i = 0; i < extraPayments.length; i++) {
                const e = extraPayments[i];

                if (paymentDate === e.paymentDate) {
                    entry.date = paymentDate,
                        entry.description = `${entry.description.split('-')[0]} - (${e.paymentType}) Pago #${i + 2}`
                    entry.amount = e.amount
                    entry.currency = e.currency

                    ledger.entries.push(entry)
                } else {
                    const MONTH = new Date(e.paymentDate).getMonth()
                    const YEAR = new Date(e.paymentDate).getFullYear()

                    const otherLedger = await Ledger.findOne({
                        month: MONTH,
                        year: YEAR
                    })

                    entry.date = e.paymentDate
                    entry.description = `${entry.description.split('-')[0]} - (${e.paymentType}) Pago #${i + 2}`
                    entry.amount = e.amount
                    entry.currency = e.currency

                    if (otherLedger) {
                        otherLedger.entries.push(entry)
                        await otherLedger.save()

                    } else {
                        await Ledger.create({
                            month: MONTH,
                            year: YEAR,
                            entries: [entry]
                        })
                    }

                }

            }
            await ledger.save()
        }

    } else {
        // ##### no se guarda
    }

    return
}

export const registerUpdatedEntries = async (data, ledger_data, reservation, editor) => {
    const {
        client,
        amount,
        currency,
        paymentDate,
        paymentType,
        extraPayments
    } = data

    if (!client) return

    const clientData = await Client.findById(client)

    const entry = {
        date: paymentDate,
        entryType: 'income',
        description: `Reserva de ${clientData.name} (${clientData.nationality}) -  (${paymentType}) ${!!extraPayments?.length ? 'Pago #1' : ''}`,
        amount,
        currency,
        reservation,
        editor
    }

    const MONTH = new Date(paymentDate).getMonth()
    const YEAR = new Date(paymentDate).getFullYear()

    const ledger = await Ledger.findOne({
        month: MONTH,
        year: YEAR
    })

    ledger.entries.push(entry)
    await ledger.save()

    if (!!extraPayments?.length) {
        // si hay extras, recorremos
        // si la fecha de ese pago es igual, guardamos
        // si es diferente, buscamos o creamos nuevo doc y guardamos
        for (let i = 0; i < extraPayments.length; i++) {
            const e = extraPayments[i];

            if (paymentDate === e.paymentDate) {
                entry.date = paymentDate,
                    entry.description = `${entry.description.split('-')[0]} - (${e.paymentType}) Pago #${i + 2}`
                entry.amount = e.amount
                entry.currency = e.currency

                ledger.entries.push(entry)
            } else {
                const MONTH = new Date(e.paymentDate).getMonth()
                const YEAR = new Date(e.paymentDate).getFullYear()

                const otherLedger = await Ledger.findOne({
                    month: MONTH,
                    year: YEAR
                })

                entry.date = e.paymentDate
                entry.description = `${entry.description.split('-')[0]} - (${e.paymentType}) Pago #${i + 2}`
                entry.amount = e.amount
                entry.currency = e.currency

                if (otherLedger) {
                    otherLedger.entries.push(entry)
                    await otherLedger.save()

                } else {
                    await Ledger.create({
                        month: MONTH,
                        year: YEAR,
                        entries: [entry]
                    })
                }

            }

        }
        await ledger.save()
    }

    return
}

export const registerQuickEntry = async (data, editor, reservation) => {
    const {
        client,
        amount,
        currency,
        paymentDate,
        paymentType
    } = data
    console.log('@@@@registerQuickEntry', data);

    if (!client) return

    const clientData = await Client.findById(client)

    const entry = {
        date: paymentDate,
        entryType: 'income',
        description: `Reserva de ${clientData.name} (${clientData.nationality}) -  (${paymentType}) Pago Extra`,
        amount,
        currency,
        reservation,
        editor
    }

    const MONTH = new Date(paymentDate).getMonth()
    const YEAR = new Date(paymentDate).getFullYear()

    const ledger = await Ledger.findOne({
        month: MONTH,
        year: YEAR
    })

    if (ledger) {
        ledger.entries.push(entry)
        await ledger.save()

    } else {
        await Ledger.create({
            month: MONTH,
            year: YEAR,
            entries: [entry]
        })
    }
}