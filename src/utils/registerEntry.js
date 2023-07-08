import Ledger from "../apiServices/ledger/model.js";
import Client from "../apiServices/client/model.js";

const saveEntries = async (template, date, extraPayments = false) => {
    const entry = { ...template }

    const MONTH = new Date(date).getMonth()
    const YEAR = new Date(date).getFullYear()

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

            if (date === e.paymentDate) {
                entry.date = date,
                    entry.description = `${entry.description.split('-')[0]} - Pago #${i + 2}`
                entry.paymentType = e.paymentType
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
                entry.description = `${entry.description.split('-')[0]} - Pago #${i + 2}`
                entry.paymentType = e.paymentType
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
}

export const registerEntry = async (data, creator, reservation) => {
    const {
        client,
        // checkin,
        amount,
        currency,
        paymentDate,
        paymentType,
        extraPayments
    } = data

    //? agrego el movimiento a las cuentas
    // const today = new Date(new Date().toLocaleDateString('en'))
    // if (new Date(checkin) >= today) {
    const clientData = await Client.findById(client)

    const entry = {
        date: paymentDate,
        entryType: 'income',
        description: `Reserva de ${clientData.name} (${clientData.nationality})${!!extraPayments?.length ? ' - Pago #1' : ''}`,
        paymentType,
        amount,
        currency,
        reservation,
        creator
    }
    // console.log(entry);

    await saveEntries(entry, paymentDate, extraPayments)

    // } else {
    // ##### no se guarda
    // }

    return
}

export const registerUpdatedEntries = async (data, reservation, editor) => {
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
        description: `Reserva de ${clientData.name} (${clientData.nationality})${!!extraPayments?.length ? ' - Pago #1' : ''}`,
        paymentType,
        amount,
        currency,
        reservation,
        editor
    }

    await saveEntries(entry, paymentDate, extraPayments)

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

    if (!client) return

    const clientData = await Client.findById(client)

    const entry = {
        date: paymentDate,
        entryType: 'income',
        description: `Reserva de ${clientData.name} (${clientData.nationality}) - Pago Extra`,
        paymentType,
        amount,
        currency,
        reservation,
        editor
    }

    await saveEntries(entry, paymentDate)
}