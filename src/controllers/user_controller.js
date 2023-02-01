import * as dotenv from 'dotenv'
dotenv.config()
import User from '../models/user.js'
import jwt from "jsonwebtoken";
import { verifyJWT } from './verify.js';
import nodemailer from "nodemailer";
import { google } from "googleapis";

const {
    CLIENT_MAIL,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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
        const {
            email,
            password,
            newPassword,
        } = req.body

        if (!email) return res.json({ error: 'No user email.' })
        if (!password) return res.json({ error: 'No old password.' })
        if (!newPassword) return res.json({ error: 'No new password.' })
        if (password === newPassword) return res.json({ error: 'New and old passwords can not be the same.' })

        const userFound = await User.findOne({ email })

        if (userFound) {
            const correctPassword = await userFound.comparePassword(password)
            if (correctPassword) {
                userFound.password = newPassword
                await userFound.save()

                return res.json({ message: 'Contraseña actualizada.', userFound })
            }
        } else {
            return res.json({ error: 'No hay usuarios asociados a ese email.' })
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

            const accessToken = await oAuth2Client.getAccessToken();
            const transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: CLIENT_MAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken,
                },
            });

            //!! VOLVER
            //? armar bien el link
            // FRONT_URL + /user/resetPasswordToken?t= + token
            //? cambiar email

            const token = jwt.sign({ user: { id: userFound.id, email } }, process.env.JWT_SECRET, {
                expiresIn: 1000 * 60 * 15,
            }),
                link = `link del front + token: ${token}`

            const mailOptions = {
                from: `Clarita admin automático <${CLIENT_MAIL}>`,
                // to: email,
                to: 'mars-shadow@hotmail.com',
                subject: 'Cambio de contraseña',
                html: `
                <section 
                    style="
                    font-family: 'Poppins', sans-serif;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 2rem;
                    overflow-x: hidden;
                    box-sizing: border-box;
                    text-align: center;
                    background-color: black;
                    color: white;
                    font-size: 1.5rem;
                    ">
                <h3 style="font-size: 1.75rem;">Se recibio una solicitud para restablecer tu contraseña</h3>
                <p>continúa el proceso ingresando <a href="${link}" target="_blank">aquí</a></p>
                <p>o con el siguiente enlace:</p>
                <a href="${link}" target="_blank">${link}</a>
                </br>
                <b>${link}</b>
                </br>
                <i>este código expira en 15 minutos</i>
                </section>
                `,
            };

            const result = await transport.sendMail(mailOptions);
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
        console.log(t);
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

// const adminUpdate = async (req, res, next) => {
//     try {

//     } catch (error) {
//         next(error)
//     }
// }

// const roleUpdate = async (req, res, next) => {
//     try {

//     } catch (error) {
//         next(error)
//     }
// }

export {
    signin,
    login,
    autoLogin,
    changePassword,
    forgotPassword,
    checkPasswordToken,
    newPassword
}