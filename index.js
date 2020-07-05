const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
var chalk = require('chalk');
var connected = chalk.bold.yellowBright;

//Loading Global app configuration
const config = require('./config/config.js');
// End Here

const bodyParser = require("body-parser");

const session = require("express-session");

const cookieSession = require('cookie-session')

const helmet = require('helmet');

const compression = require('compression');

var path = require('path');

const fs = require('fs');

const routes = require("./routes/index.js");

// capturing log in access file with morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);



require("./utils/db");
app.use(cors()); // cors is for cross origin resources for issue with front end backend ports
app.use(morgan("dev", { stream: accessLogStream }));
app.use(bodyParser.json());

//Helmet header security
app.use(helmet.xssFilter())
app.use(helmet.frameguard())
// End here

// asset compression for zipping files 
app.use(compression())
//End here


app.use(cookieSession({
  name: 'session',
  keys: [
    process.env.COOKIE_KEY1,
    process.env.COOKIE_KEY2
  ]
}))

app.use("/", routes);

app.listen(global.gConfig.port, () =>
  console.log(connected(`${global.gConfig.app_name} listening on port ${global.gConfig.port}`))
)
