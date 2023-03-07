import Cabin from "./model.js"
import { updateCabinReservs } from "./utils.js"

const getCabin = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No cabin ID' })

        const { error } = await updateCabinReservs(id)
        if (error) return res.json(error)

        // populate path AND subdocument path
        const cabin = await Cabin.findById(id)
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json({ cabin })

    } catch (error) {
        next(error)
    }
}

const getAllCabins = async (req, res, next) => {
    try {
        const cabins = await Cabin.find()

        for (let i = 0; i < cabins.length; i++) {
            const cabin = cabins[i];
            await updateCabinReservs(cabin.id)
        }

        // populate path AND subdocument path
        const cabinsList = await Cabin.find()
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json(cabinsList)

    } catch (error) {
        next(error)
    }
}

const createCabin = async (req, res, next) => {
    try {
        const {
            name,
            identifier,
            capacity,
            icon
        } = req.body

        if (!name) return res.json({ error: 'No cabin name' })
        if (!identifier) return res.json({ error: 'No cabin identifier' })
        if (!capacity) return res.json({ error: 'No cabin capacity' })
        // if (!icon) return res.json({ error: 'No cabin icon' })

        //: checkear que el nombre no se repita
        const nameInUse = await Cabin.findOne({ name })
        if (nameInUse) return res.json({ error: 'El nombre ya está en uso' })

        let aux = {}
        name && (aux.name = name)
        capacity && (aux.capacity = capacity)
        identifier && (aux.identifier = identifier)
        icon && (aux.icon = icon)

        const newCabin = await Cabin.create(
            {
                ...aux,
                reservations: []
            }
        )

        const cabinsList = await Cabin.find()
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json({
            message: 'Cabaña creada exitosamente.',
            cabin: newCabin,
            cabinsList
        })

    } catch (error) {
        next(error)
    }
}

const editCabin = async (req, res, next) => {
    try {
        const { id } = req.query
        const {
            name,
            identifier,
            capacity,
            icon
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!name) return res.json({ error: 'No cabin name' })
        if (!capacity) return res.json({ error: 'No cabin capacity' })

        //: checkear que el numbre no se repita
        const nameInUse = await Cabin.findOne({ name })
        if (nameInUse && nameInUse.id !== id) return res.json({ error: 'El nombre ya está en uso' })

        const targetCabin = await Cabin.findById(id)
        if (!targetCabin) return res.json({ error: 'No cabins with that ID' })

        name && (targetCabin.name = name)
        capacity && (targetCabin.capacity = capacity)
        identifier && (targetCabin.identifier = identifier)
        icon && (targetCabin.icon = icon)
        await targetCabin.save()

        const cabinsList = await Cabin.find()
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json({
            message: 'Cabaña actualizada exitosamente.',
            cabin: targetCabin,
            cabinsList
        })

    } catch (error) {
        next(error)
    }
}

const deleteCabin = async (req, res, next) => {
    try {
        const { id } = req.query

        if (!id) return res.json({ error: 'No ID' })

        await Cabin.findByIdAndDelete(id)

        const cabinsList = await Cabin.find()
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json({
            message: 'Cabaña eliminada exitosamente.',
            cabinsList
        })

    } catch (error) {
        next(error)
    }
}

const changeAvailability = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const targetCabin = await Cabin.findById(id)
        if (!targetCabin) return res.json({ error: 'No cabins with that ID' })

        targetCabin.enabled = !targetCabin.enabled
        await targetCabin.save()

        const cabinsList = await Cabin.find()
            .populate('current_guest')
            .populate({
                path: 'current_guest',
                populate: 'client'
            })

        return res.json({
            message: 'Disponibilidad actualizada.',
            cabinsList
        })

    } catch (err) {
        next(err)
    }
}

export {
    getCabin,
    getAllCabins,
    createCabin,
    editCabin,
    deleteCabin,
    changeAvailability
}