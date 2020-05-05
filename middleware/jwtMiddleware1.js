const jwt = require('jsonwebtoken')
var config = require('./../utills/config');



module.exports = {
    createTokens = function (user, secret, secret2){
        const createToken = jwt.sign(
            {
                user: user,
            },
            secret,
            {
                expiresIn: config.ACCESS_TOKEN_LIFE,
            },
        );

        const createRefreshToken = jwt.sign(
            {
                user: user,
            },
            secret2,
            {
                expiresIn: config.REFRESH_TOKEN_LIFE,
            },
        );

        return ([createToken, createRefreshToken]);
    },

    refreshTokens = function (token, refreshToken, models, SECRET, SECRET_2){
        let userId = -1;
        try {
            const { user: { id } } = jwt.decode(refreshToken);
            userId = id;
        } catch (err) {
            return {};
        }

        if (!userId) {
            return {};
        }

        const user = ''

        if (!user) {
            return {};
        }

        const refreshSecret = SECRET_2 + user.password;

        try {
            jwt.verify(refreshToken, refreshSecret);
        } catch (err) {
            return {};
        }

        const [newToken, newRefreshToken] =  createTokens(user, SECRET, refreshSecret);
        return {
            token: newToken,
            refreshToken: newRefreshToken,
            user,
        };
    },

    jwtSignin = function(req, res, next, { userId, admin }){
        const user = { id: userId }
        const [token, refreshToken] = createTokens(user, config.ACCESS_TOKEN_LIFE, config.ACCESS_TOKEN_SECRET);

        return {
            token,
            refreshToken,
        };
    },


}