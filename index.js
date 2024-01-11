require('dotenv').config();
const express = require("express");
const credentials = require("./src/utils/middleware/credentials");
const corsOptions = require("./src/config/corsOptions");
const viewEngine = require("./src/config/configViewEngine");
const initRoutes = require("./src/route");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require('node-cron');
const reminder = require('./src/utils/reminder');
const connectDB = require('./src/config/configDB');

connectDB();
const app = express();
// app.use(credentials);
// app.use(cors(corsOptions));

// reminder
// cron.schedule('* * * * *', reminder); // run in every minute

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// view engine
viewEngine(app);


// allow read json and xxx.urlencoded
app.use(bodyParser.json({ }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
initRoutes(app);

app.use("*", (req, res) => {
  const err = Error(`Requested path ${req.path} not found`);
  res.status(404).send({
    success: false,
    message: `Requested path ${req.path} not found`,
    stack: err.stack,
  });
});
// config PORT
const port = process.env.PORT || 3000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`🚀 Server is listening at port http://localhost:${port}`);
});

module.exports = app;