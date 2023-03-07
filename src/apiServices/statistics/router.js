import { Router } from "express"
const router = Router()
import {
    test,
    getMonth
} from "./controller.js"
import { verifyToken } from "../../utils/verify.js"

router.get('/', verifyToken, test)
router.get('/month', verifyToken, getMonth)

export { router }