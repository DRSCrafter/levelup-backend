const express = require('express');
const multer = require('multer');
const {Product, validateProduct} = require('../models/product');
const {User} = require('../models/user');
const {Order} = require('../models/order');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/products');
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
    const product = await Product.findById(req.params.id);

    if (!product)
        return res.status(400).send("product not found!");

    product.stock = req.body.stock;
    await product.save();

    res.send("success");
})

router.put('/:id/like', async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product)
        return res.status(400).send("product not found!");

    if (req.body.isIncrement)
        product.likes = product.likes + 1;
    else
        product.likes = product.likes - 1;

    await product.save();

    res.send("success");
})

module.exports = router;
