import { Router } from "express"
const router = Router()
import {
    getUser,
    getAllUsers,
    adminPwUpdate,
    roleUpdate,
    adminEmailUpdate,
    approveUser,
    deleteUser
} from "./controller.js"
import {
    setMessage,
    deleteMessage,
} from "../announcement/controller.js"

router.get('/', getUser)
router.get('/all', getAllUsers)
router.put('/password', adminPwUpdate)
router.put('/email', adminEmailUpdate)
router.put('/role', roleUpdate)
router.put('/approve', approveUser)
router.delete('/delete', deleteUser)

router.post('/announcement', setMessage)
router.delete('/announcement', deleteMessage)

export { router }