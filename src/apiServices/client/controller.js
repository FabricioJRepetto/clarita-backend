import Client from "./model.js";

const createClient = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const {
            name,

            dni,
            age,
            profession,
            civil_status,
            plate,
            vehicleType,

            company,
            cuil,

            telephone,
            email,
            address,
            nationality,
            country_code,
            provenance,
            notes
        } = req.body

        if (!name) return res.json({ error: 'No name' })
        if (!company && !dni) return res.json({ error: 'No DNI' })
        if (company && !cuil) return res.json({ error: 'No CUIL' })

        if (dni) {
            const dniInUse = await Client.findOne({ dni })
            if (dniInUse) return res.json({ error: 'El DNI ya está en uso.' })
        }
        if (cuil) {
            const cuilInUse = await Client.findOne({ cuil })
            if (cuilInUse) return res.json({ error: 'El CUIL ya está en uso.' })
        }

        const newClient = await Client.create({ ...req.body, creator: user_name })

        const allClients = await Client.find()
        return res.json({ message: 'Cliente registrado.', newClient, clientList: allClients })

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
        const { id } = req.query
        const {
            name,

            dni,
            age,
            plate,
            vehicleType,
            profession,
            civil_status,

            company,
            cuil,

            telephone,
            email,
            address,
            nationality,
            country_code,
            provenance,

            notes
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!name) return res.json({ error: 'No name' })
        if (!company && !dni) return res.json({ error: 'No DNI' })
        if (company && !cuil) return res.json({ error: 'No CUIL' })

        // si cambió, checkear que el DNI/CUIL nuevo no esté en uso
        const client = await Client.findById(id)

        if (company) {
            if (!client?.cuil || client?.cuil !== cuil) {
                const cuilInUse = await Client.findOne({ cuil })
                if (cuilInUse) return res.json({ error: 'El nuevo CUIL ya está en uso.' })
            }
        } else {
            if (!client?.dni || client?.dni !== dni) {
                const dniInUse = await Client.findOne({ dni })
                if (dniInUse) return res.json({ error: 'El nuevo DNI ya está en uso.' })
            }
        }

        const newClient = await Client.findByIdAndUpdate(
            id,
            {
                $set: { ...req.body }
            },
            { new: true }
        )

        const allClients = await Client.find()
        return res.json({ message: 'Ciente actualizado exitosamente.', newClient, clientList: allClients })

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

        //: TODO: buscar reservas de este usuario y eliminarlas?

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