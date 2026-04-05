const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const {
  browseProductsValidator,
} = require("../utils/validators/storeValidator");
const { browseProducts } = require("../services/storeService");

// route base: /api/store
router.get(
  "/products",
  protect,
  allwodTo("USER"),
  browseProductsValidator,
  browseProducts,
);

module.exports = router;
