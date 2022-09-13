const express = require("express");
const {Company} = require("../models/company");

const router = express.Router();
router.get('/:category', async (req, res) => {
    const companies = await Company.find({
        categories: {
            $elemMatch: {
                $eq: req.params.category
            }
        }
    });

    res.send(companies);
});

module.exports = router;
