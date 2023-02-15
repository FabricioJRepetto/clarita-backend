import { Router } from "express"
const router = Router()
import {
    signin,
    login,
    autoLogin,
    changePassword, // cambiar pw usando pw anterior
    forgotPassword, // pedir cambio de pw por mail
    checkPasswordToken, // autentificar codigo de mail
    newPassword, // setear nueva pw
    changeEmail,
    checkEmailToken
} from "./controller.js"
import { getMessage } from "../announcement/controller.js";
import { verifyToken, verifyRole } from "../../utils/verify.js";
import { router as adminRouter } from "./adminRouter.js";

router.post('/signin', signin)
router.post('/login', login)
router.get('/autologin', autoLogin)
router.put('/changePassword', verifyToken, changePassword)
router.post('/forgotPassword', forgotPassword)
router.get('/checkPasswordToken', checkPasswordToken)
router.put('/newPassword', newPassword)
router.put('/changeEmail', verifyToken, changeEmail)
router.put('/checkEmailToken', checkEmailToken)
router.get('/announcement', getMessage)

//: Admin
router.use('/admin', verifyToken, verifyRole, adminRouter)


export { router }