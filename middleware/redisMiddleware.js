const REDIS_PORT = process.env.REDIS_PORT || 6379;

var redis = require('redis')
var client = redis.createClient(REDIS_PORT)

client.on('error', function (err) {
    console.log('Error ' + err)
})


module.exports = {
    redisSetKey: async function (key, value, time) {
        if (key && value) {

            await client.set(key, JSON.stringify(value), function (error, response) {
                if (error) {
                    console.log("Redis Error", error)
                    return error;
                }
                console.log("Redis save message", response)
            });

        }
    },


    redisGetKey: function (key, req, res, next) {

        let result = client.get(key, function (error, product) {
            if (error) {
                console.log(error)
                return false;

            }
            if (product) {
                //res.json(JSON.parse(product));

                res.send({ product: JSON.parse(product) });
                next();

            }

        });
    },

    client: client
}
