const express = require("express");
const cors = require("cors");

const product = require("../routes/products");
const user = require("../routes/users");
const company = require("../routes/companies");
const banner = require("../routes/banners");

module.exports = function(app) {
    app.use(express.json());
    app.use("/uploads", express.static("uploads"));
    app.use(cors({ exposedHeaders: "x-auth-token" }));
    app.use("/api/products", product);
    app.use("/api/users", user);
    app.use("/api/companies", company);
    app.use("/api/banners", banner);
}