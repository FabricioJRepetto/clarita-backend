import { Router } from "express"
const router = Router()
import {
    getAll,
    getWeek,
    getMonth,
    getYear,
    newEntry,
    updateEntry,
    deleteEntry
} from "./controller.js"
import { verifyToken, verifyRole } from "../../utils/verify.js"

router.get('/', verifyToken, getWeek)
router.get('/month', verifyToken, getMonth)
router.get('/year', verifyToken, getYear)
router.get('/all', verifyToken, getAll)
router.post('/', verifyToken, newEntry)
router.put('/', verifyToken, updateEntry)
router.delete('/', verifyToken, deleteEntry)

export { router }