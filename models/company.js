const Joi = require('joi');
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: String,
    categories: [String]
})

const Company = mongoose.model('Company', companySchema);

module.exports.companySchema = companySchema;
module.exports.Company = Company;
