import { Router } from "express"
const router = Router()
import { router as userRouter } from "../apiServices/user/router.js"
import { router as clientRouter } from "../apiServices/client/router.js"
import { router as reservationRouter } from "../apiServices/reservation/router.js"
import { router as cabinRouter } from "../apiServices/cabin/router.js"
import { verifyToken } from "../utils/verify.js"

router.get("/", (__, res) => {
    res.send("Hello World!");
});
router.get('/sensei', (__, res) => {
    res.send('El facusama te bendice.')
})

router.use('/user', userRouter)
router.use('/client', verifyToken, clientRouter)
router.use('/reservation', verifyToken, reservationRouter)
router.use('/cabin', verifyToken, cabinRouter)

export default router