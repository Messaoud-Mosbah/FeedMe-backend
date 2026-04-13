const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { Product, RestaurantProfile } = require("../models");

// helper: resolve the restaurant profile of the logged-in user
const getRestaurantProfile = async (userId, next) => {
  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) {
    next(new ApiError("Restaurant profile not found", 404));
    return null;
  }
  return profile;
};

// @desc   Get all products of the logged-in restaurant
// @route  GET /api/restaurant/products
// @access RESTAURANT
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
  if (!profile) return;

  const products = await Product.findAll({
    where: { restaurantProfileId: profile.id },
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Products fetched successfully",
    data: { results: products.length, products },
    errors: null,
  });
});

// @desc   Get single product (own store only)
// @route  GET /api/restaurant/products/:id
// @access RESTAURANT
exports.getOneProduct = asyncHandler(async (req, res, next) => {
  const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
  if (!profile) return;

  const product = await Product.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });

  if (!product) return next(new ApiError("Product not found", 404));

  res.status(200).json({
    status: "SUCCESS",
    message: "Product fetched successfully",
    data: { product },
    errors: null,
  });
});
exports.createProduct = asyncHandler(async (req, res, next) => {
  const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
  if (!profile) return;

  const { name, description, price, category, preparingTime } = req.body;

  const imageFile = req.files?.image?.[0];
  const image = /uploads/images/${imageFile.filename};

  const product = await Product.create({
    name,
    description,
    price,
    image,
    preparingTime,
    category: typeof category === "string" ? JSON.parse(category) : category,
    restaurantProfileId: profile.id,
  });

  res.status(201).json({
    status: "SUCCESS",
    message: "Product created successfully",
    data: { product },
    errors: null,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
  if (!profile) return;

  const product = await Product.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });

  if (!product) return next(new ApiError("Product not found", 404));

  const { name, description, price, category, preparingTime } = req.body;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (preparingTime !== undefined) product.preparingTime = preparingTime;
  if (category !== undefined) {
    product.category =
      typeof category === "string" ? JSON.parse(category) : category;
  }

  const imageFile = req.files?.image?.[0];
  if (imageFile) {
    product.image = /uploads/images/${imageFile.filename};
  }

  await product.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Product updated successfully",
    data: { product },
    errors: null,
  });
});
// @desc   Delete a product (own store only)
// @route  DELETE /api/restaurant/products/:id
// @access RESTAURANT
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
  if (!profile) return;

  const product = await Product.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });

  if (!product) return next(new ApiError("Product not found", 404));

  await product.destroy();

  res.status(200).json({
    status: "SUCCESS",
    message: "Product deleted successfully",
    data: null,
    errors: null,
  });
});
