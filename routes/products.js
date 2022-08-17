const express = require('express');
const multer = require('multer');
const {Product, validateProduct} = require('../models/product');
const {User} = require('../models/user');
const {Order} = require('../models/order');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        callback(null, true);
    else
        callback(null, false);
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: fileFilter
});

router.post('/', upload.single('productImage'), async (req, res) => {
    const {error} = validateProduct(req.body);
    if (error)
        return res.status(400).send('Invalid credentials');

    if (!req.file)
        return res.status(422).send('No image provided');

    const product = new Product({
        name: req.body.name,
        company: req.body.company,
        type: req.body.type,
        productImage: req.file.path,
        price: req.body.price,
        description: req.body.description,
        stock: req.body.stock
    })

    await product.save();
    res.send(product);
});

router.put('/:id/stock', async (req, res) => {
    const product = Product.findById(req.params.id);

    if (!product)
        return res.status(400).send("product not found!");

    product.stock = req.body.stock;
    await product.save();

    res.send("success");
})

router.put('/:id/like', async (req, res) => {
    const product = Product.findById(req.params.id);

    if (!product)
        return res.status(400).send("product not found!");

    if (req.body.isIncrement)
        product.likes = product.likes + 1;
    else
        product.likes = product.likes - 1;

    await product.save();

    res.send("success");
})

router.post('order/:id', async (req, res) => {
    const user = User.findById(req.params.id);
    if (!user)
        return res.status(400).send("user not found!");

    const product = Product.findById(req.body.productID);
    if (!product)
        return res.status(400).send("product not found!");

    if (product.stock < req.body.quantity)
        return res.status(400).send("not enough in stock!");

    const order = new Order({
        productID: product._id,
        name: product.name,
        quantity: req.body.quantity,
        totalPrice: req.body.totalPrice
    });

    user.shoppingCart.push(order);
    await user.save();

    res.send(order);

    product.stock = product.stock - req.body.quantity;
    await product.save();
})

module.exports = router;
