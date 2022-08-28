const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Product } = require("../models/product");
const { User, validateUser } = require("../models/user");
const { Order } = require("../models/order");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/users");
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

router.post("/", upload.single("userImage"), async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send("Invalid credentials");

  if (!req.file) return res.status(422).send("No image provided");

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    userImage: req.file.path,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  res.header("x-auth-token", token).send(user);
});

router.put("/:id/shoppingCart", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("user not found!");

  let totalCost = 0;

  for (let item of user.shoppingCart) {
    totalCost += item.totalPrice;
  }

  if (totalCost > user.account)
    return res.status(400).send("not enough money!");

  for (let item of user.shoppingCart) {
    user.order.push(item);
  }

  user.account -= totalCost;
  user.shoppingCart = [];
  await user.save();

  res.send("success");
});

router.put("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("user not found!");

  const vaildPassword = await bcrypt.compare(req.body.password, user.password);
  if (!vaildPassword) return res.status(401).send("Wrong password!");

  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  res.header("x-auth-token", token).send(user);
});

router.put("/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("user not found!");

  res.send(user);
});

router.put("/:id/account", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("user not found!");

  user.account += req.body.charge;
  await user.save();

  res.send("success");
});

router.post("/:id/order", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("user not found!");

  const product = await Product.findById(req.body.productID);
  if (!product) return res.status(400).send("product not found!");

  if (product.stock < req.body.quantity)
    return res.status(400).send("not enough in stock!");

  let order = null;

  if (!req.body.itemExists) {
    order = new Order({
      productID: product._id,
      name: product.name,
      quantity: req.body.quantity,
      totalPrice: req.body.totalPrice,
    });
    user.shoppingCart.push(order);
  } else {
    const orderIndex = user.shoppingCart.findIndex(
      (item) => item.productID == req.body.productID
    );
    order = user.shoppingCart[orderIndex];
    order.quantity = order.quantity + req.body.quantity;
    order.totalPrice = order.totalPrice + req.body.totalPrice;
    user.shoppingCart[orderIndex] = order;
  }

  await user.save();

  res.send("success");

  product.stock = product.stock - req.body.quantity;
  await product.save();
});

router.put("/:id/order/delete", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("user not found!");

  const product = await Product.findById(req.body.productID);
  if (!product) return res.status(401).send("product not found!");

  user.shoppingCart = user.shoppingCart.filter(
    (order) => order.productID != req.body.productID
  );
  await user.save();

  product.stock = product.stock + req.body.quantity;
  await product.save();
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).send("User not found!");

  res.send(user);
});

router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User not found!");

  res.send(user);
});

router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found!");

  const productID = new ObjectId(req.body.productID);

  const index = user.shoppingCart.findIndex((product) =>
    productID.equals(productID._id)
  );
  user.shoppingCart.splice(index, 1);

  res.send("success!");
});

module.exports = router;
