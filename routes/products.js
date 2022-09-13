const express = require("express");
const multer = require("multer");
const {Product, validateProduct} = require("../models/product");
const {User} = require("../models/user");
const {Order} = require("../models/order");
const {Company} = require("../models/company");

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
    // const {error} = validateProduct(req.body);
    // if (error)
    //     return res.status(400).send('Invalid credentials');

    if (!req.files) return res.status(422).send("No image provided");

    const paths = req.files.map((file) => file.path);

    const product = new Product({
        name: req.body.name,
        company: req.body.company,
        type: req.body.type,
        category: req.body.category,
        productImage: paths[0],
        thumbnailImage: paths[1],
        price: req.body.price,
        description: req.body.description,
        details: req.body.details,
        stock: req.body.stock,
    });

    const company = await Company.findOne({
        name: req.body.company
    });
    if (!company) {
        const newCompany = new Company({
            name: req.body.company,
            categories: []
        });
        newCompany.categories.push(req.body.category);

        await newCompany.save();
    } else if (!company.categories.includes(req.body.category)) {
        company.categories.push(req.body.category);

        await company.save();
    } else
        console.log('reached!');

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
    const user = await User.findById(req.body.userID);

    if (!product) return res.status(400).send("product not found!");
    if (!user) return res.status(400).send("user not found!");

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
    console.log(req.body);
    const products1 = await Product.find({
        type: req.body.type,
        category: req.body.category,
    }).limit(8);
    const products2 = await Product.find({
        type: req.body.type,
        category: {$ne: req.body.category},
    }).limit(8 - products1.length);
    const products = products1.concat(products2);

    res.send(products);
});

router.get("/search/:str", async (req, res) => {
    const products = await Product.find({
        name: {$regex: new RegExp(req.params.str), $options: "i"},
    });
    if (!products) return res.status(404).send("didn't find anything!");

    res.send(products);
});

router.put("/filter/", async (req, res) => {
    const products = await Product.find({
        name: {$regex: new RegExp(req.body.name), $options: "i"},
        "company.name":
            req.body.companies.length !== 0
                ? {$in: req.body.companies}
                : {$regex: /.*./},
        stock: req.body.isAvailable === "1" ? {$gte: 1} : {$gte: 0},
    })
        .select("name price thumbnailImage stock")
        .sort(req.body.sort);

    res.send(products);
});

router.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("product not found!");

    res.send(product);
});

module.exports = router;
