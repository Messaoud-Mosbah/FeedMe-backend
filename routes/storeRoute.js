const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const {
  allProductsValidators,
} = require("../utils/validators/storeValidator");
const {
  allProducts,
} = require("../services/storeService");
// route base: /api/store

router.get(
  "/products",
   allProductsValidators,
  allProducts,
);

module.exports = router;
