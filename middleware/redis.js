const redis = require("redis");
const { promisify } = require("util");
var chalk = require('chalk');
var connected = chalk.bold.cyan;
var error = chalk.bold.yellow;
var disconnected = chalk.bold.red;
var termination = chalk.bold.magenta;

const client = redis.createClient(global.gConfig.REDIS_PORT_WITH_URL);

client.on('connect', function () {
  console.log(connected('Redis client connected on port', global.gConfig.REDIS_PORT_WITH_URL))
});

client.on('error', function (err) {
  console.log(error('Something went wrong! Redis client ' + err))
});


module.exports = {
  ...client,
  getAsync: promisify(client.get).bind(client),
  setAsync: promisify(client.set).bind(client),
  delAsync: promisify(client.del).bind(client),
  keysAsync: promisify(client.keys).bind(client),
};
