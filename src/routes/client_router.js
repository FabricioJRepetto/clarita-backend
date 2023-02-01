import { Router } from "express"
const router = Router()
import {
    getClient,
    getAllClients,
    createClient,
    editClient,
    deleteClient
} from "../controllers/client_controller.js"
import { verifyToken } from "../controllers/verify.js"

router.get('/', verifyToken, getClient)
router.get('/all', verifyToken, getAllClients)
router.post('/', verifyToken, createClient)
router.put('/', verifyToken, editClient)
router.delete('/', verifyToken, deleteClient)

export { router }