import Cabin from "./model.js";

const getCabin = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No cabin ID' })

        const cabin = await Cabin.findById(id)
        if (!cabin) return res.json({ error: 'No cabins with that ID' })

        return res.json(cabin)

    } catch (error) {
        next(error)
    }
}

const getAllCabins = async (req, res, next) => {
    try {
        const cabinsList = await Cabin.find()
        return res.json(cabinsList)

    } catch (error) {
        next(error)
    }
}

const createCabin = async (req, res, next) => {
    try {
        const { name } = req.body
        if (!name) return res.json({ error: 'No cabin name' })

        const newCabin = await Cabin.create(
            {
                name,
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
        const {
            id,
            name
        } = req.body

        if (!id) return res.json({ error: 'No ID' })
        if (!name) return res.json({ error: 'No cabin name' })

        const targetCabin = await Cabin.findById(id)
        if (!targetCabin) return res.json({ error: 'No cabins with that ID' })

        targetCabin.name = name
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