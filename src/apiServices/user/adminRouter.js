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

//: Admin
router.get('/', getUser)
router.get('/all', getAllUsers)
router.put('/password', adminPwUpdate)
router.put('/role', roleUpdate)
router.put('/email', adminEmailUpdate)
router.put('/approve', approveUser)

export { router }