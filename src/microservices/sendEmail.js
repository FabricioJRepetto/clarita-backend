import * as dotenv from 'dotenv'
dotenv.config()
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

const {
    CLIENT_MAIL,
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    REFRESH_TOKEN,
    JWT_SECRET,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendEmail = async (type, email, id) => {

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

    //!! TODO:
    //? armar bien el link
    // FRONT_URL + /user/resetPasswordToken?t= + token
    //? cambiar email

    const token = jwt.sign({ user: { id, email } }, JWT_SECRET, {
        expiresIn: 1000 * 60 * 15,
    }),
        link = `http://localhost:3000/user/resetpassword?token=${token}`

    const template = {
        reset_pw: {
            subject: 'Cambio de contraseña',
            body: `<section 
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
                <b>${token}</b>
                </br>
                <i>este código expira en 15 minutos</i>
                </section>`
        },
        change_email: {
            subject: 'Confirmación de email',
            body: `<section 
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
                <h3 style="font-size: 1.75rem;">Se recibio una solicitud de cambio de email</h3>
                <p>continúa el proceso ingresando <a href="${link}" target="_blank">aquí</a></p>
                <p>o con el siguiente enlace:</p>
                <a href="${link}" target="_blank">${link}</a>
                </br>
                <b>${link}</b>
                </br>
                <i>este código expira en 15 minutos</i>
                </section>`
        },
    }

    const mailOptions = {
        from: `Admin Cabañas Clarita <${CLIENT_MAIL}>`,
        to: email,
        subject: template[type].subject,
        html: template[type].body,
    };

    const result = await transport.sendMail(mailOptions);
    console.log('error: ' + String(!!result?.result?.rejected?.length));
    return result
}