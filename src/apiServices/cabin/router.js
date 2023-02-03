import { Router } from "express"
const router = Router()
import {
    getCabin,
    getAllCabins,
    createCabin,
    editCabin,
    deleteCabin
} from "./controller.js";
import { verifyToken, verifyRole } from "../../utils/verify.js"

router.get('/', verifyToken, verifyRole, getCabin)
router.get('/all', verifyToken, verifyRole, getAllCabins)
router.post('/', verifyToken, verifyRole, createCabin)
router.put('/', verifyToken, verifyRole, editCabin)
router.delete('/', verifyToken, verifyRole, deleteCabin)

export { router }