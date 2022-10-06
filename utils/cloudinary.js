const cloudinary = require("cloudinary").v2;
const config = require("config");

cloudinary.config({
  cloud_name: config.get("cloudName"),
  api_key: config.get("cloudApiKey"),
  api_secret: config.get("cloudApiSecret"),
});

module.exports = cloudinary;
