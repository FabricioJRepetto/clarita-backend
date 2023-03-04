import { Router } from "express"
const router = Router()
import { router as userRouter } from "../apiServices/user/router.js"
import { router as clientRouter } from "../apiServices/client/router.js"
import { router as reservationRouter } from "../apiServices/reservation/router.js"
import { router as cabinRouter } from "../apiServices/cabin/router.js"
import { router as ledgerRouter } from "../apiServices/ledger/router.js"
import { router as statisticsRouter } from "../apiServices/statistics/router.js"
import { verifyToken } from "../utils/verify.js"

router.get("/", (__, res) => {
    res.send("Bienvenido al backend de Cabañas Clarita!");
});
router.get('/sensei', (__, res) => {
    res.send('El facusama te bendice.')
})

router.use('/user', userRouter)
router.use('/client', verifyToken, clientRouter)
router.use('/reservation', verifyToken, reservationRouter)
router.use('/cabin', verifyToken, cabinRouter)
router.use('/ledger', verifyToken, ledgerRouter)
router.use('/statistics', verifyToken, statisticsRouter)

export default router