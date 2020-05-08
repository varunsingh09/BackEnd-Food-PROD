const redis = require("redis");
const redis_url = process.env.REDIS_PORT_WITH_URL || null;
const client = redis.createClient(redis_url);
client.on('error', function (err) {
    console.log('Error ' + err)
})


module.exports = {
    getCached: (req, res, next) => {
        const { redis_key } = req.headers
        client.get(redis_key, function (err, reply) {
            if (err) {
                res.status(500).json({
                    message: "Somethin Went Wrong"
                })
            }
            if (reply == null) {
                next()
            } else {
                res.status(200).json({
                    message: `Success Read ${redis_key}`,
                    data: JSON.parse(reply)
                })
            }
        });
    },
    caching: (key, data) => {
        client.set(key, JSON.stringify(data))
    },
    delCache: (key) => {
        client.del(key)
    }
}