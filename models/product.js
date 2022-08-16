const Joi = require('joi');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    company: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    thumbnailImage: {
        type: String,
        required: true
    },
    fullImage: {
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
        maxLength: 1024
    },
    stock: {
        type: Number,
        required: true
    }
})

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        company: Joi.string().required(),
        type: Joi.string().required(),
        price: Joi.string().required(),
        description: Joi.string().max(1024).required(),
        stock: Joi.required()
    })

    return schema.validate(product);
}

module.exports.Product = Product;
module.exports.validateProduct = validateProduct;