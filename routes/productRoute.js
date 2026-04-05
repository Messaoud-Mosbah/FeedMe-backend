const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const upload = require("../middlewares/uploadMiddleware");
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} = require("../utils/validators/productValidator");
const {
  getAllProducts,
  getOneProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

// all routes below require a valid JWT + RESTAURANT role
router.use(protect, allwodTo("RESTAURANT"));

router.get("/", getAllProducts);

router.get("/:id", productIdValidator, getOneProduct);

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  createProductValidator,
  createProduct,
);

router.patch(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateProductValidator,
  updateProduct,
);

router.delete("/:id", productIdValidator, deleteProduct);

module.exports = router;
