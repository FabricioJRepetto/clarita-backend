import * as dotenv from 'dotenv'
dotenv.config()
import User from '../models/user.js'
import jwt from "jsonwebtoken";
import { verifyJWT } from './verify.js';
import { sendEmail } from '../utils/sendEmail.js';

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
                user_name,
                email,
                password
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
            const correctPassword = await userFound.comparePassword(password)
            if (correctPassword) {
                const {
                    id,
                    email,
                    user_name,
                    role
                } = userFound,
                    aux = { id, email, user_name, role },
                    token = jwt.sign({ user: aux }, process.env.JWT_SECRET, {
                        expiresIn: 1000 * 60 * 60 * 24 * 7,
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

        return res.status(200).json({ message: 'Loged in succesfully', ...user })

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

        if (!email) return res.json({ error: 'No user email.' })

        const userFound = await User.findOne({ email })

        if (userFound) {
            const result = await sendEmail('reset_pw', email, userFound.id);
            return res.json({ result });
        } else {
            return res.json({ error: 'No hay usuarios asociados a ese email.' })
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

const adminPwUpdate = async (req, res, next) => {
    try {
        const {
            user_id,
            newPassword
        } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newPassword) return res.json({ error: 'No password received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: 'No password received.' })

        targetUser.password = newPassword
        await targetUser.save()

        return res.json({ message: `Contraseña del usuario ${targetUser.user_name} actualizada.` })

    } catch (error) {
        next(error)
    }
}

const roleUpdate = async (req, res, next) => {
    try {
        const {
            user_id,
            newRole
        } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newRole) return res.json({ error: 'No role received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: 'No password received.' })

        targetUser.role = newRole
        await targetUser.save()

        return res.json({ message: `Rol del usuario ${targetUser.user_name} actualizado a "${targetUser.role}".` })

    } catch (error) {
        next(error)
    }
}

const adminEmailUpdate = async (req, res, next) => {
    try {
        const {
            user_id,
            newEmail
        } = req.body

        if (!user_id) return res.json({ error: 'No user id received.' })
        if (!newEmail) return res.json({ error: 'No email received.' })

        const targetUser = await User.findById(user_id)

        if (!targetUser) return res.json({ error: `No user found with this id: ${user_id}.` })

        targetUser.email = newEmail
        await targetUser.save()

        return res.json({ message: `Email del usuario ${targetUser.user_name} actualizado a "${newEmail}".` })

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
    adminEmailUpdate
}