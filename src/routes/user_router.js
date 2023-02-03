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
    changeEmail,
    checkEmailToken,
    adminPwUpdate,
    roleUpdate,
    adminEmailUpdate
} from "../controllers/user_controller.js"
import { verifyToken, verifyRole } from "../controllers/verify.js";

router.post('/signin', signin)
router.post('/login', login)
router.get('/autologin', autoLogin)
router.put('/changePassword', verifyToken, changePassword) // cambiar pw usando pw anterior
router.get('/forgotPassword', forgotPassword) // pedir cambio de pw por mail
router.get('/checkPasswordToken', checkPasswordToken) // autentificar codigo de mail
router.put('/newPassword', newPassword) // setear nueva pw

router.put('/changeEmail', verifyToken, changeEmail)
router.put('/checkEmailToken', checkEmailToken)

//: Admin
router.put('/adminPwUpdate', verifyToken, verifyRole, adminPwUpdate)
router.put('/roleUpdate', verifyToken, verifyRole, roleUpdate)
router.put('/adminEmailUpdate', verifyToken, verifyRole, adminEmailUpdate)

export { router }