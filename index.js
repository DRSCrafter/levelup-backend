const express = require("express");
const mongoose = require("mongoose");
const config = require("config");

const app = express();

require("./startup/logging");
require("./startup/routes")(app);
require("./startup/prod")(app);

if (!config.get("jwtPrivateKey")) {
  throw new Error("FATAL ERROR: Private Key is not defined!");
}

const db = config.get("db");
mongoose
  .connect(db, { ignoreUndefined: true })
  .then(() => console.log(`Connected to ${db}...`));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
