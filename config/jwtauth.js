const jwt = require('jsonwebtoken')
require("dotenv").config();

let configKey = process.env.JWT_KEY

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.headers['x-access-token'] || req.session.token

    if(!token){
        res.status(400).send('<p>You are not logged in</p> <br /> <a href=/login>Login Here</a>')
    } else {
        try {
            let decoded = jwt.verify(token, configKey)
            req.user = decoded
        } catch(err) {
            return res.status(400).send(err)
        }

        return next();
    }
}

module.exports = verifyToken;