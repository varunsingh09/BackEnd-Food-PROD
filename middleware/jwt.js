const jwt = require('jsonwebtoken')
var config = require('./../utills/config');
const client = require('./redis')


let tokenList = {}
//console.log("default tokenList",tokenList)


module.exports = {

    jwtSignin: function (req, res, next, { userId, admin }) {

        const user = { id: userId }
        // do the database authentication here, with user name and password combination.
        const token = jwt.sign(user, config.ACCESS_TOKEN_SECRET, { expiresIn: config.ACCESS_TOKEN_LIFE })

        const refreshToken = jwt.sign(user, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_LIFE })

        tokenList[refreshToken] = refreshToken
        //set token in cache
        client.setAsync('tokenList', JSON.stringify(tokenList));

        //console.log("jwtSignin===>>", tokenList)
        return res.status(200).send({ success: "success", token: token, refresh_token: refreshToken, admin: admin })

    },

    jwtVerifyToken: async function (req, res, next) {
        let { authorization } = req.headers
        const refreshToken = authorization && authorization.split(' ')[1]
        //console.log("jwtVerifyToken", req.headers)

        let tokenData = await client.getAsync('tokenList');


        let tokenList = tokenData === null ? {} : JSON.parse(tokenData)


        if (!refreshToken && refreshToken === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });

        if (refreshToken in tokenList) {
            let userId = req.body_user_id
            const user = { id: userId }

            const token = jwt.sign(user, config.ACCESS_TOKEN_SECRET, { expiresIn: config.ACCESS_TOKEN_LIFE })

            // update the token in the list
            tokenList[refreshToken] = token
            await lient.setAsync('tokenList', JSON.stringify(tokenList));

            return res.status(200).send({ success: "success", refresh_token: token })
        } else {
            if (refreshToken && refreshToken !== undefined) return res.status(403).send({ errors: [{ auth: false, "msg": 'The client was not authorized to access the webpage.' }] });
        }

    },


    authenticateToken: function (req, res, next) {

        let authHeader = req.body['authorization'] || req.query['authorization'] || req.headers['authorization']

        const refresh_token = authHeader && authHeader.split(' ')[1]
        // decode token

        if (refresh_token) {
            // verifies secret and checks exp
            jwt.verify(refresh_token, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_LIFE }, function (err, decoded) {

                if (err) {
                    return res.status(403).send({ errors: [{ auth: false, "msg": 'The client was not authorized to access the webpage.' }] });
                }
                req.decoded = decoded;
                next();

            });
        } else {
            // if there is no token
            // return an error
            if (!refresh_token && refresh_token === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });
        }

    },

    tokenList: tokenList,

}
