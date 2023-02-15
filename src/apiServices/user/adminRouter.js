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
import {
    getMessage,
    setMessage,
    deleteMessage,
} from "../announcement/controller.js"

router.get('/', getUser)
router.get('/all', getAllUsers)
router.put('/password', adminPwUpdate)
router.put('/email', adminEmailUpdate)
router.put('/role', roleUpdate)
router.put('/approve', approveUser)

router.post('/announcement', setMessage)
router.delete('/announcement', deleteMessage)

export { router }