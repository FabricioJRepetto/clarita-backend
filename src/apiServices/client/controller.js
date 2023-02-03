import Client from "./model.js";

const createClient = async (req, res, next) => {
    try {
        const {
            name,
            dni,
            age,
            telephone,
            profession,
            civil_status,
            origin,
            origin: {
                address,
                nationality,
                provenance
            },
            vehicle,
            vehicle: {
                plate,
                type
            },
            notes
        } = req.body

        if (!name) return res.json({ error: 'No name' })
        if (!dni) return res.json({ error: 'No DNI' })
        if (!age) return res.json({ error: 'No age' })
        if (!telephone) return res.json({ error: 'No telephone' })
        if (!profession) return res.json({ error: 'No profession' })
        if (!origin) return res.json({ error: 'No origin' })
        if (!vehicle) return res.json({ error: 'No vehicle' })
        if (!notes) return res.json({ error: 'No notes' })

        const dniInUse = await Client.findOne({ dni })
        if (dniInUse) return res.json({ error: 'El DNI ya está en uso.' })

        const newClient = await Client.create(
            {
                name,
                dni,
                age,
                telephone,
                profession,
                civil_status,
                origin,
                vehicle,
                notes
            }
        )

        const allClients = await Client.find()
        return res.json({ clientList: allClients })

    } catch (error) {
        next(error)
    }
}

const getClient = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const client = await Client.findByIdAndDelete(id)
        if (!client) return res.json({ error: 'Usuario no encontrado (ID incorrecta).' })
        else return res.json({ client })

    } catch (error) {
        next(error)
    }
}

const getAllClients = async (req, res, next) => {
    try {
        const allClients = await Client.find()
        return res.json({ clientList: allClients })
    } catch (error) {
        next(error)
    }
}

const editClient = async (req, res, next) => {
    try {
        const {
            id,
            name,
            dni,
            age,
            telephone,
            profession,
            civil_status,
            origin,
            vehicle,
            notes
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!name) return res.json({ error: 'No name' })
        if (!dni) return res.json({ error: 'No DNI' })
        if (!age) return res.json({ error: 'No age' })
        if (!telephone) return res.json({ error: 'No telephone' })
        if (!profession) return res.json({ error: 'No profession' })
        if (!civil_status) return res.json({ error: 'No civil_status' })
        if (!origin) return res.json({ error: 'No origin' })
        if (!vehicle) return res.json({ error: 'No vehicle' })
        if (!notes) return res.json({ error: 'No notes' })

        // si cambió, checkear que el DNI no esté en uso
        const client = await Client.findById(id)
        if (client.dni !== dni) {
            const dniInUse = await Client.findOne({ dni })
            if (dniInUse) return res.json({ error: 'El nuevo DNI ya está en uso.' })
        }

        const newClient = await Client.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    dni,
                    age,
                    telephone,
                    profession,
                    civil_status,
                    origin,
                    vehicle,
                    notes
                }
            },
            { new: true }
        )

        const allClients = await Client.find()
        return res.json({ newClient, clientList: allClients })

    } catch (error) {
        next(error)
    }
}
const deleteClient = async (req, res, next) => {
    try {
        const { id } = req.query

        if (!id) return res.json({ error: 'No ID' })

        const existingID = await Client.findById(id)
        if (!existingID) return res.json({ error: 'No hay usuarios con esa ID.' })

        await Client.findByIdAndDelete(id)

        const allClients = await Client.find()
        return res.json({ message: 'Cliente eliminado.', clientList: allClients })

    } catch (error) {
        next(error)
    }
}

export {
    getClient,
    getAllClients,
    createClient,
    editClient,
    deleteClient
}