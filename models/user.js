const Joi = require('joi');
const mongoose = require('mongoose');

const {orderSchema} = require('../models/order');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 100
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 255
    },
    account: {
        type: Number,
        required: true,
        default: 0
    },
    shoppingCart: [orderSchema],
    order: [orderSchema]
})

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        company: Joi.string().required(),
        type: Joi.string().required(),
        price: Joi.string().required(),
        description: Joi.string().max(1024).required(),
        stock: Joi.required()
    })

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;