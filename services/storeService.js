const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");
const { Product, RestaurantProfile, User } = require("../models");
const ApiError = require("../utils/apiError");


// @desc   Browse all products across all restaurants
// @route  GET /api/store/products
// @access USER
exports.allProducts = asyncHandler(async (req, res, next) => {
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
   const products = await Product.findAll({
    include: [
      {
        model: RestaurantProfile,
        as: "restaurant",
        attributes: ["id", "restaurantName", "restaurantLogoUrl"],
        include: [
          {
            model: User,
            attributes: ["userName"],
          },
        ],
      },
    ],
  });

  const nextCursor =
    products.length > 0 ? products[products.length - 1].createdAt : null;

  res.status(200).json({
    status: "SUCCESS",
    message: "Products fetched successfully",
    data: { products,
         nextCursor,
    results: products.length,
     },
 
    errors: null,
  });
});
