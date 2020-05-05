const jwt = require('jsonwebtoken')
var config = require('./config');


let refreshTokens = []


module.exports = {

    jwtVerifyToken: function (req, res, next) {

        let userId = req.body_user_id
        let { authorization } = req.headers
        const token = authorization && authorization.split(' ')[1]

        if (!token && token === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });

        jwt.verify(token, config.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).send({ errors: [{ auth: false, "msg": 'The client was not authorized to access the webpage.' }] });

            const accessToken = jwt.sign({ id: userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: config.EXPIRE_TIME });
            res.status(200).send({ success: "success", token: accessToken })
        });

    },

    jwtSignin: function (req, res, next, { userId, admin }) {

        const accessToken = jwt.sign({ id: userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: config.EXPIRE_TIME });
        const refreshToken = jwt.sign({ id: userId }, config.REFRESH_TOKEN_SECRET);

        refreshTokens.push(refreshToken);
        res.status(200).send({ success: "success", access_token: accessToken, refresh_token: refreshToken, admin: admin })

    },



    authenticateToken: function (req, res, next) {
        let { authorization } = req.headers
        const token = authorization && authorization.split(' ')[1]

        //console.log(token)
        if (!token && token === undefined) return res.status(401).send({ errors: [{ "msg": 'No token provided.' }] });
            
            jwt.verify(token, config.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(403).send({ errors: [{ auth: false, "msg": 'The client was not authorized to access the webpage.' }] });

                req.user = user;
                next();
            });

    },

    refreshTokens: refreshTokens,

}
