const jwt = require('jsonwebtoken')
var config = require('./config');


let tokenList = {}


module.exports = {

    jwtSignin: function (req, res, next, { userId, admin }) {

        const user = { id: userId }
        // do the database authentication here, with user name and password combination.
        const token = jwt.sign(user, config.ACCESS_TOKEN_SECRET, { expiresIn: config.ACCESS_TOKEN_LIFE })
        const refreshToken = jwt.sign(user, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_LIFE })

        const response = {
            "token": token,
            "refreshToken": refreshToken,
        }

        tokenList[refreshToken] = response

        res.status(200).send({ success: "success", token: token, refreshToken: refreshToken, admin: admin })

    },

    jwtVerifyToken: function (req, res, next) {
        let { authorization } = req.headers
        const refreshToken = authorization && authorization.split(' ')[1]
        //console.log(refreshToken, "====", tokenList)
        if (refreshToken in tokenList) {
            let userId = req.body_user_id
            const user = { id: userId }

            const token = jwt.sign(user, config.ACCESS_TOKEN_SECRET, { expiresIn: config.ACCESS_TOKEN_LIFE })

            // update the token in the list
            tokenList[refreshToken].token = token

            res.status(200).send({ success: "success", token: token })
        } else {
            if (!refreshToken && refreshToken === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });
        }

    },


    authenticateToken: function (req, res, next) {

        let  authHeader  = req.body['authorization'] || req.query['authorization'] || req.headers['authorization']

        const token = authHeader && authHeader.split(' ')[1]
        // decode token

        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_LIFE } ,function (err, decoded) {

                if (err) {
                    return res.status(403).send({ errors: [{ auth: false, "msg": 'The client was not authorized to access the webpage.' }] });
                }
                req.decoded = decoded;
                next();

            });
        } else {
            // if there is no token
            // return an error
            if (!token && token === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });
        }















    },

    tokenList: tokenList,

}
