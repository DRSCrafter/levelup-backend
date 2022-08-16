const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
})

const Order = mongoose.model('Order', orderSchema);

function validateOrder(order) {
    const schema = Joi.object({
        id: Joi.string().required(),
        name: Joi.string().min(3).max(50).required(),
        dateBrought: Joi.date().required(),
        quantity: Joi.number().required(),
        totalPrice: Joi.number().required(),
    })

    return schema.validate(order);
}

module.exports.Order = Order;
module.exports.validateOrder = validateOrder;