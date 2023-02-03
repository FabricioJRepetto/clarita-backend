import { Router } from "express"
const router = Router()
import { router as userRouter } from "./user_router.js"
import { router as clientRouter } from "./client_router.js"
import { router as reservationRouter } from "./reservation_router.js"
import { router as cabinRouter } from "./cabin_router.js"

import { verifyToken } from "../controllers/verify.js"

router.use('/sensei', (req, res, next) => {
    res.send('El facusama te bendice.')
})

router.use('/user', userRouter)
router.use('/client', verifyToken, clientRouter)
router.use('/reservation', verifyToken, reservationRouter)
router.use('/cabin', verifyToken, cabinRouter)

export default router