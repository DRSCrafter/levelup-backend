const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    dateBought: {
        type: String,
        required: true,
        default: Date.now()
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
})

const Order = mongoose.model('Order', orderSchema);

function validateOrder(order) {
    const schema = Joi.object({
        productID: Joi.string().required(),
        name: Joi.string().min(3).max(50).required(),
        quantity: Joi.number().required(),
        totalPrice: Joi.number().required(),
    })

    return schema.validate(order);
}

module.exports.orderSchema = orderSchema;
module.exports.Order = Order;
module.exports.validateOrder = validateOrder;