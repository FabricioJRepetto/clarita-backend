import { Router } from "express"
const router = Router()
import {
    getReservation,
    getAllReservations,
    createReservation,
    editReservation,
    deleteReservation
} from "../controllers/reservation_controller.js"
import { verifyToken, verifyRole } from "../controllers/verify.js"

router.get('/', verifyToken, getReservation)
router.get('/all', verifyToken, getAllReservations)
router.post('/', verifyToken, createReservation) //: -
router.put('/', verifyToken, editReservation)
router.delete('/', verifyToken, deleteReservation)

export { router }