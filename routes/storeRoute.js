const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const {
  browseProductsValidator,
  productDetailValidator,
} = require("../utils/validators/storeValidator");
const {
  browseProducts,
  getProductDetail,
} = require("../services/storeService");
// route base: /api/store
router.get(
  "/products",
  protect,
  allwodTo("USER"),
  browseProductsValidator,
  browseProducts,
);
router.get(
  "/products/:id",
  protect,
  allwodTo("USER"),
  productDetailValidator, // reuse the id validator or make a new one
  getProductDetail,
);
module.exports = router;
