const Joi = require("joi");
const mongoose = require("mongoose");

const { orderSchema } = require("../models/order");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 100,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 255,
  },
  userImage: {
    type: String,
  },
  account: {
    type: Number,
    required: true,
    default: 0,
  },
  shoppingCart: [orderSchema],
  order: [orderSchema],
  likes: [String],
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(10).max(100).required(),
    password: Joi.string().required(),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
