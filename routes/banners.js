const express = require("express");
const multer = require("multer");
const { Product, validateProduct } = require("../models/product");
const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Company } = require("../models/company");
const { Banner } = require("../models/banner");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/banners");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  )
    callback(null, true);
  else callback(null, false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

router.post("/", upload.single("bannerImage"), async (req, res) => {
  if (!req.file) return res.status(400).send("No image provided!");

  const product = await Product.findById(req.body.productID);
  if (!product) return res.status(400).send("Product not found!");

  const banner = new Banner({
    productID: req.body.productID,
    name: req.body.name,
    bannerImage: req.file.path,
  });

  await banner.save();

  res.send(banner);
});

router.get("/", async (req, res) => {
  const banners = await Banner.find();

  res.send(banners);
});

module.exports = router;
