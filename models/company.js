const Joi = require('joi');
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    _id: false,
    name: {
        type: String,
        required: true,
    }
})

const Company = mongoose.model('Company', companySchema);

module.exports.companySchema = companySchema;
module.exports.Company = Company;
