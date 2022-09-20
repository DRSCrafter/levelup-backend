const express = require("express");
const mongoose = require("mongoose");
const config = require('config');

const app = express();
require('./startup/routes')(app);

if (!config.get("jwtPrivateKey")) {
  console.error("Private Key not defined!");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost/levelup", { ignoreUndefined: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.log("Connection failed!"));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
