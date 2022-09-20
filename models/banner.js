const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  productID: String,
  name: String,
  bannerImage: String,
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports.bannerSchema = bannerSchema;
module.exports.Banner = Banner;
