const Joi = require('joi');
const mongoose = require('mongoose');

const {companySchema} = require('../models/company');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    company: {
        type: companySchema,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 2048
    },
    stock: {
        type: Number,
        required: true
    },
    likes: {
        type: Number,
        required: true,
        default: 0
    }
})

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        company: {name: Joi.string().required()},
        type: Joi.string().required(),
        price: Joi.string().required(),
        description: Joi.string().max(2048).required(),
        stock: Joi.required()
    })

    return schema.validate(product);
}

module.exports.Product = Product;
module.exports.validateProduct = validateProduct;