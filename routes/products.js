const express = require("express");
const multer = require("multer");
const { Product, validateProduct } = require("../models/product");
const { User } = require("../models/user");
const { Order } = require("../models/order");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/products");
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

router.post("/", upload.array("images"), async (req, res) => {
  const { error } = validateProduct(req.body);
  // if (error)
  //     return res.status(400).send('Invalid credentials');

  if (!req.files) return res.status(422).send("No image provided");

  const paths = req.files.map((file) => file.path);

  const product = new Product({
    name: req.body.name,
    company: req.body.company,
    type: req.body.type,
    productImage: paths[0],
    thumbnailImage: paths[1],
    price: req.body.price,
    description: req.body.description,
    details: req.body.details,
    stock: req.body.stock,
  });

  await product.save();
  res.send(product);
});

router.put("/:id/stock", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(400).send("product not found!");

  product.stock = req.body.stock;
  await product.save();

  res.send("success");
});

router.put("/:id/like", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(400).send("product not found!");

  if (req.body.isIncrement) product.likes = product.likes + 1;
  else product.likes = product.likes - 1;

  await product.save();

  res.send("success");
});

router.get("/search/", async (req, res) => {
  const products = await Product.find({
    name: { $regex: new RegExp(req.body.name), $options: "i" },
  });
  if (!products) return res.status(404).send("didn't find anything!");

  res.send(products);
});

router.put("/filter/", async (req, res) => {
  const products = await Product.find({
    name: { $regex: new RegExp(req.body.name), $options: "i" },
    "company.name":
      req.body.companies.length !== 0
        ? { $in: req.body.companies }
        : { $regex: /.*./ },
    stock: req.body.isAvailable ? { $gte: 1 } : { $gte: 0 },
  }).select("name price thumbnailImage stock");

  res.send(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("product not found!");

  res.send(product);
});

module.exports = router;
