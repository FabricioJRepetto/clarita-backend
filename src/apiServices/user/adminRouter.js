import { Router } from "express"
const router = Router()
import {
    getUser,
    getAllUsers,
    adminPwUpdate,
    roleUpdate,
    adminEmailUpdate,
    approveUser
} from "./controller.js"
import { getMessage } from "../announcement/controller.js"

router.get('/', getUser)
router.get('/all', getAllUsers)
router.put('/password', adminPwUpdate)
router.put('/email', adminEmailUpdate)
router.put('/role', roleUpdate)
router.put('/approve', approveUser)

router.get('/announcement', getMessage)
router.post('/announcement', getMessage)
router.delete('/announcement', getMessage)

export { router }