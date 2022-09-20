const express = require("express");
const { Company } = require("../models/company");

const router = express.Router();
router.get("/:category", async (req, res) => {
  const companies = await Company.find({
    categories: {
      $elemMatch: {
        $eq: req.params.category,
      },
    },
  });
  const companyNames = companies.map((company) => company.name);

  res.send(companyNames);
});

module.exports = router;
