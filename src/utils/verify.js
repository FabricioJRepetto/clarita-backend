import User from '../apiServices/user/model.js'
import jwt from "jsonwebtoken";

const verifyJWT = async (token) => {
    try {
        const userDecoded = jwt.verify(token, process.env.JWT_SECRET),
            userFound = await User.findById(userDecoded.user.id)

        return { user: userDecoded.user, userFound }
    } catch (err) {
        throw new Error(err)
    }
}

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) return res.json({ error: "No token recibed" })

        const { user, userFound } = await verifyJWT(token)

        if (!userFound) return res.json({ error: "User not found" })

        req.user = user

        next()
    } catch (err) {
        console.log(err);
        if (err?.name === "TokenExpiredError")
            return res.json({
                error: "Sesión expirada, inicia sesión nuevamente.",
                expiredToken: true,
            });
        return res.json({ error: "verifyToken error: " + err });
    }
}

const verifyRole = async (req, res, next) => {
    try {
        const { role } = req.user

        if (!role) return res.json({ error: 'Rol no definido.' })
        if (role !== 'admin') return res.json({ error: 'Permisos insuficientes.' })

        next()
    } catch (err) {
        console.log(err);
        return res.json({ error: "verifyRole error: " + err });
    }
}

export {
    verifyJWT,
    verifyToken,
    verifyRole
}