const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { Company } = require("../models/company");

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

router.post("/", upload.array("images"), async (req, res) => {
  if (!req.files) return res.status(422).send("No image provided");

  console.log(req.files[0]);
  const productImgUpload = await cloudinary.uploader.upload(req.files[0].path);
  const thumbnailImgUpload = await cloudinary.uploader.upload(
    req.files[1].path
  );

  const product = new Product({
    name: req.body.name,
    company: req.body.company,
    type: req.body.type,
    category: req.body.category,
    productImage: productImgUpload.url,
    thumbnailImage: thumbnailImgUpload.url,
    price: req.body.price,
    description: req.body.description,
    details: req.body.details,
    stock: req.body.stock,
  });

  const company = await Company.findOne({
    name: req.body.company,
  });
  if (!company) {
    const newCompany = new Company({
      name: req.body.company,
      categories: [],
    });
    newCompany.categories.push(req.body.category);

    await newCompany.save();
  } else if (!company.categories.includes(req.body.category)) {
    company.categories.push(req.body.category);

    await company.save();
  }

  await product.save();
  res.send(product);
});

router.put("/:id/stock", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(400).send("کالا یافت نشد!");

  product.stock = req.body.stock;
  await product.save();

  res.send("success");
});

router.put("/:id/like", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const user = await User.findById(req.body.userID);

  if (!product) return res.status(400).send("کالا یافت نشد!");
  if (!user) return res.status(400).send("کاربر یافت نشد!");

  if (req.body.isIncrement) {
    product.likes = product.likes + 1;
    user.likes.push(req.params.id);
  } else {
    product.likes = product.likes - 1;
    user.likes = user.likes.filter((id) => id !== req.params.id);
  }

  await product.save();
  await user.save();

  res.send("success");
});

router.put("/related", async (req, res) => {
  const products1 = await Product.find({
    type: req.body.type,
    category: req.body.category,
  })
    .limit(8)
    .select("name price stock thumbnailImage");
  const products2 = await Product.find({
    type: req.body.type,
    category: { $ne: req.body.category },
  })
    .limit(8 - products1.length)
    .select("_id name price stock thumbnailImage");
  const products = [...products1, ...products2];

  res.send(products);
});

router.get("/search/:str", async (req, res) => {
  const products = await Product.find({
    name: { $regex: new RegExp(req.params.str), $options: "i" },
  });
  if (!products) return res.status(404).send("موردی یافت نشد!");

  res.send(products);
});

router.put("/filter/", async (req, res) => {
  const products = await Product.find({
    name: { $regex: new RegExp(req.body.name), $options: "i" },
    company:
      req.body.companies.length !== 0
        ? { $in: req.body.companies }
        : { $regex: /.*./ },
    stock: req.body.isAvailable === "1" ? { $gte: 1 } : { $gte: 0 },
    category: req.body.category,
  })
    .select("name price thumbnailImage stock")
    .sort(req.body.sort);

  res.send(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("کالا یافت نشد!");

  res.send(product);
});

module.exports = router;
