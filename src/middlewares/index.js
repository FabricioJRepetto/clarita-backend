export const allowCors = () => async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
        //? agregado 'Authorization' header para evitar error de cors en preflight
    )
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    next()
}

export const error404 = async (req, res, next) => {
    next({ status: 404, message: "Incorrect method/endpoint" })
}

export const generalErrorHandler = async (err, req, res, next) => {
    console.error(`\x1b[31m❌\x1b[0m · `, err)
    const status = err.status || 500
    const message = err.message || err
    res.status(status).json({ error: message })
}