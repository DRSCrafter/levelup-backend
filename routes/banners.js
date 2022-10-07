const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const { Product } = require("../models/product");
const { Banner } = require("../models/banner");

const router = express.Router();

const storage = multer.diskStorage({});

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
  if (!req.file) return res.status(400).send("تصویری ارائه نشده!");

  const product = await Product.findById(req.body.productID);
  if (!product) return res.status(400).send("کالا یافت  نشد!");

  const result = await cloudinary.uploader.upload(req.file.path);

  const banner = new Banner({
    productID: req.body.productID,
    name: req.body.name,
    bannerImage: result.url,
  });

  await banner.save();

  res.send(banner);
});

router.get("/", async (req, res) => {
  const banners = await Banner.find();

  res.send(banners);
});

module.exports = router;
