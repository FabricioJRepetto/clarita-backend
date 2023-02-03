import { Router } from "express"
const router = Router()
import {
    getClient,
    getAllClients,
    createClient,
    editClient,
    deleteClient
} from "../controllers/client_controller.js"
import { verifyToken, verifyRole } from "../controllers/verify.js"

router.post('/', verifyToken, createClient)
router.get('/', verifyToken, getClient)
router.get('/all', verifyToken, getAllClients)
router.put('/', verifyToken, editClient)
router.delete('/', verifyToken, verifyRole, deleteClient)

export { router }