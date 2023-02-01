import { Router } from "express"
const router = Router()
import {
    signin,
    login,
    autoLogin,
    changePassword,
    forgotPassword,
    checkPasswordToken,
    newPassword,
    // adminUpdate,
    // roleUpdate
} from "../controllers/user_controller.js"
import { verifyToken, verifyRole } from "../controllers/verify.js";

router.post('/signin', signin)
router.post('/login', login)
router.get('/autologin', autoLogin)
//? cambiar password usando pw anterior
router.put('/changePassword', verifyToken, changePassword)
//? pedir cambio de password por mail
router.get('/forgotPassword', forgotPassword)
//? autentificar codigo de mail
router.get('/checkPasswordToken', checkPasswordToken)
//? setear nueva password
router.put('/newPassword', newPassword)

// router.put('/adminUpdate', verifyToken, verifyRole, adminUpdate)
// router.put('/roleUpdate', verifyToken, verifyRole, roleUpdate)

export { router }