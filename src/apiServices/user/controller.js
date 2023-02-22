import * as dotenv from 'dotenv'
dotenv.config()
import User from './model.js'
import jwt from "jsonwebtoken";
import { verifyJWT } from '../../utils/verify.js';
import { sendEmail } from '../../microservices/sendEmail.js';
const { JWT_SECRET } = process.env

const signin = async (req, res, next) => {
    try {
        const {
            user_name,
            email,
            password
        } = req.body

        if (!user_name) return res.json({ error: 'No user name.' })
        if (!email) return res.json({ error: 'No user email.' })
        if (!password) return res.json({ error: 'No user password.' })

        const emailInUse = await User.findOne({ email })
        if (emailInUse) return res.json({ error: 'El email ya está registrado.' })

        const newUser = await User.create(
            {
                ...req.body
            }
        )

        res.json({ newUser })

    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body
        if (!email) return res.json({ error: 'No user email.' })
        if (!password) return res.json({ error: 'No user password.' })

        const userFound = await User.findOne({ email })

        if (userFound) {
            if (!userFound.approved) return res.json({ error: 'Cuenta aún no autorizada' })
            const correctPassword = await userFound.comparePassword(password)
            if (correctPassword) {
                const {
                    id,
                    email,
                    user_name,
                    role
                } = userFound,
                    aux = { id, email, user_name, role },
                    token = jwt.sign({ user: aux }, JWT_SECRET, {
                        expiresIn: '24h', // 24 hrs
                    });

                return res.json(
                    {
                        id,
                        email,
                        user_name,
                        role,
                        token
                    }
                )

            } else {
                return res.json({ error: 'Contraseña incorrecta.' })
            }
        } else {
            return res.json({ error: 'No hay usuarios asociados a ese email.' })
        }

    } catch (error) {
        next(error)
    }
}

const autoLogin = async (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) return res.json({ error: "No token received" })

        const { user, userFound } = await verifyJWT(token)

        if (!userFound) return res.json({ error: true, message: "User not found" })

        return res.status(200).json({ ...user })

    } catch (error) {
        if (error?.name === "TokenExpiredError")
            return res.json({
                error: "Sesión expirada, inicia sesión nuevamente.",
                expiredToken: true,
            });
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { id } = req.user,
            {
                password,
                newPassword,
            } = req.body

        if (!id) return res.json({ error: 'No user id.' })
        if (!password) return res.json({ error: 'No old password.' })
        if (!newPassword) return res.json({ error: 'No new password.' })
        if (password === newPassword) return res.json({ error: 'New and old passwords can not be the same.' })

        const userFound = await User.findById(id)

        if (userFound) {
            const correctPassword = await userFound.comparePassword(password)
            if (correctPassword) {
                userFound.password = newPassword
                await userFound.save()

                return res.json({ message: 'Contraseña actualizada.', userFound })
            } else {
                return res.json({ error: 'Contraseña incorrecta.' })
            }
        } else {
            return res.json({ error: 'Usuario inexistente.' })
        }

    } catch (error) {
        next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        // no especificar errores para que sea más seguro
        if (!email) return res.json({ error: '-' })

        const userFound = await User.findOne({ email })

        if (userFound) {
            const result = await sendEmail('reset_pw', email, userFound.id);
            return res.json({ result });
        } else {
            // no especificar errores para que sea más seguro
            return res.json({ error: '-' })
        }

    } catch (error) {
        next(error)
    }
}

const checkPasswordToken = async (req, res, next) => {
    try {
        const { t } = req.query
        if (!t) return res.json({ error: 'No token received' })

        const { user, userFound } = await verifyJWT(t)

        if (!userFound) return res.json({ error: 'User not found' })

        res.json({ message: 'Token authorized', user }
        )
    } catch (error) {
        next(error)
    }
}

const newPassword = async (req, res, next) => {
    try {
        const {
            t,
            newPassword
        } = req.body

        if (!t) return res.json({ error: 'No token received' })
        if (!newPassword) return res.json({ error: 'No password received' })

        const { user, userFound } = await verifyJWT(t)

        if (!userFound) return res.json({ error: 'User not found' })

        const updatedUser = await User.findById(user.id)
        updatedUser.password = newPassword
        await updatedUser.save()

        return res.json({ message: 'Contraseña actualizada.', updatedUser })

    } catch (error) {
        next(error)
    }
}

const changeEmail = async (req, res, next) => {
    try {
        const { id, email } = req.user,
            { password, newEmail } = req.body

        if (!id) return res.json({ error: 'No user id.' })
        if (!password) return res.json({ error: 'No password.' })
        if (!newEmail) return res.json({ error: 'No email.' })
        if (email === newEmail) return res.json({ error: 'Current and new email are the same.' })

        const userFound = await User.findById(id)

        if (userFound) {
            const correctPassword = await userFound.comparePassword(password)
            if (correctPassword) {
                const result = await sendEmail('change_email', newEmail, id);

                return res.json({ message: 'Se ha enviado un codigo de confirmación al email indicado.', result })
            } else {
                return res.json({ error: 'Contraseña incorrecta.' })
            }
        } else {
            return res.json({ error: 'No hay usuarios asociados a ese email.' })
        }

    } catch (error) {
        next(error)
    }
}

const checkEmailToken = async (req, res, next) => {
    try {
        const { t } = req.query
        if (!t) return res.json({ error: 'No token received' })

        const { user, userFound } = await verifyJWT(t)

        if (!userFound) return res.json({ error: 'User not found' })

        const userUpdated = await User.findById(user.id)

        userUpdated.email = user.email
        await userUpdated.save()

        res.json({ message: `Email actualizado a "${user.email}". Vuelve a iniciar sesión.`, userUpdated })

    } catch (error) {
        next(error)
    }
}

//: ADMIN ZONE
const adminPwUpdate = async (req, res, next) => {
    try {
        const { role, id } = req.user
        const {
            user_id,
            newPassword
        } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newPassword) return res.json({ error: 'No password received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: `No user found with this id: ${user_id}.` })
        if (!role !== 'master') {
            if (targetUser.role === 'admin' || targetUser.role === 'master') {
                return res.json({ error: 'No puedes editar información de un administrador.' })
            }
        }

        targetUser.password = newPassword
        await targetUser.save()

        const usersList = await User.find({ _id: { $ne: id } })

        return res.json({ message: `Contraseña del usuario ${targetUser.user_name} actualizada.`, usersList })

    } catch (error) {
        next(error)
    }
}

const roleUpdate = async (req, res, next) => {
    try {
        const { role, id } = req.user
        const { user_id, newRole } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newRole) return res.json({ error: 'No role received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: `No user found with this id: ${user_id}.` })
        if (!role !== 'master') {
            if (targetUser.role === 'admin' || targetUser.role === 'master') {
                return res.json({ error: 'No puedes editar información de un administrador.' })
            }
        }

        targetUser.role = newRole !== 'demote' ? newRole : ''
        await targetUser.save()

        const usersList = await User.find({ _id: { $ne: id } })

        return res.json({ message: `Rol del usuario ${targetUser.user_name} actualizado a "${targetUser.role}".`, usersList })

    } catch (error) {
        next(error)
    }
}

const adminEmailUpdate = async (req, res, next) => {
    try {
        const { role, id } = req.user
        const { user_id, newEmail } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newEmail) return res.json({ error: 'No email received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: `No user found with this id: ${user_id}.` })
        if (!role !== 'master') {
            if (targetUser.role === 'admin' || targetUser.role === 'master') {
                return res.json({ error: 'No puedes editar información de un administrador.' })
            }
        }

        //: verificar email unico

        targetUser.email = newEmail
        await targetUser.save()

        const usersList = await User.find({ _id: { $ne: id } })

        return res.json({ message: `Email del usuario ${targetUser.user_name} actualizado a "${newEmail}".`, usersList })

    } catch (error) {
        next(error)
    }
}

const approveUser = async (req, res, next) => {
    try {
        const { role, id } = req.user
        const { user_id } = req.body
        if (!user_id) return res.json({ error: 'No ID' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: `No user found with this id: ${user_id}.` })
        if (!role !== 'master') {
            if (targetUser.role === 'admin' || targetUser.role === 'master') {
                return res.json({ error: 'No puedes editar información de un administrador.' })
            }
        }
        if (targetUser.approved) {
            targetUser.approved = false
            targetUser.role = ''
        } else {
            targetUser.approved = true
            targetUser.role = 'staff'
        }
        await targetUser.save()

        const usersList = await User.find({ _id: { $ne: id } })

        return res.json({ message: 'Cuenta de usuario actualizada', targetUser, usersList })

    } catch (error) {
        next(error)
    }
}

const getUser = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const user = await User.findById(id)
        if (!user) return res.json({ error: `No user found with this id: ${user_id}.` })

        return res.json({ user })

    } catch (error) {
        next(error)
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const { id } = req.user

        const usersList = await User.find({ _id: { $ne: id } })
        return res.json({ usersList })

    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const { role, id } = req.user
        const { id: target_id } = req.query
        if (!id) return res.json({ error: 'No ID' })

        const user = await User.findById(target_id)
        if (!user) return res.json({ error: `No user found with this id: ${user_id}.` })
        if (!role !== 'master') {
            if (user.role === 'admin' || user.role === 'master') {
                return res.json({ error: 'No puedes eliminar a un administrador.' })
            }
        }

        await User.findByIdAndDelete(target_id)

        const usersList = await User.find({ _id: { $ne: id } })

        return res.json({ message: 'Cuenta de usuario eliminada', usersList })

    } catch (error) {
        next(error)
    }
}

export {
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
    adminEmailUpdate,
    approveUser,
    deleteUser,

    getUser,
    getAllUsers
}