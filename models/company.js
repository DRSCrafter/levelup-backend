const Joi = require('joi');
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

const Company = mongoose.model('Company', companySchema);

function validateCompany(company) {
    const schema = Joi.object({
        name: Joi.string().required(),
    })

    return schema.validate(company);
}

module.exports.companySchema = companySchema;
module.exports.Company = Company;
module.exports.validateCompany = validateCompany;