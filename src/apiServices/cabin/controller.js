import Cabin from "./model.js"
import { updateCabinGuest } from "./utils.js"

const getCabin = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No cabin ID' })

        const { error } = await updateCabinGuest(id)
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
            await updateCabinGuest(cabin.id)
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
            icon
        } = req.body
        let aux = {}
        if (!name) return res.json({ error: 'No cabin name' })
        if (!identifier) return res.json({ error: 'No cabin identifier' })
        // if (!icon) return res.json({ error: 'No cabin icon' })

        //: checkear que el nombre no se repita
        const nameInUse = await Cabin.findOne({ name })
        if (nameInUse) return res.json({ error: 'El nombre ya está en uso' })

        name && (aux.name = name)
        identifier && (aux.identifier = identifier)
        icon && (aux.icon = icon)

        const newCabin = await Cabin.create(
            {
                ...aux,
                reservations: []
            }
        )

        const cabinsList = await Cabin.find()

        return res.json({
            message: 'Cabaña creada.',
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
            icon
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!name) return res.json({ error: 'No cabin name' })

        //: checkear que el numbre no se repita
        const nameInUse = await Cabin.findOne({ name })
        if (nameInUse && nameInUse.id !== id) return res.json({ error: 'El nombre ya está en uso' })

        const targetCabin = await Cabin.findById(id)
        if (!targetCabin) return res.json({ error: 'No cabins with that ID' })

        name && (targetCabin.name = name)
        identifier && (targetCabin.identifier = identifier)
        icon && (targetCabin.icon = icon)
        await targetCabin.save()

        const cabinsList = await Cabin.find()

        return res.json({
            message: 'Cabaña actualizada.',
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

        return res.json({
            message: 'Cabaña eliminada.',
            cabinsList
        })

    } catch (error) {
        next(error)
    }
}

export {
    getCabin,
    getAllCabins,
    createCabin,
    editCabin,
    deleteCabin
}