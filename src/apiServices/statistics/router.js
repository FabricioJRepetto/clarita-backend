import { Router } from "express"
const router = Router()
import {
    test
} from "./controller.js"
import { verifyToken } from "../../utils/verify.js"

router.get('/', verifyToken, test)

export { router }