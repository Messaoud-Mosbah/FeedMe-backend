const asyncHandler = require("express-async-handler");
const { Op, Sequelize } = require("sequelize");
const { Product, RestaurantProfile, User } = require("../models");
const ApiError = require("../utils/apiError");
const SORT_OPTIONS = {
  price_desc: [
    ["price", "DESC"],
    ["createdAt", "DESC"],
  ],
  price_asc: [
    ["price", "ASC"],
    ["createdAt", "DESC"],
  ],
  preparation_desc: [
    ["preparingTime", "DESC"],
    ["createdAt", "DESC"],
  ],
  preparation_asc: [
    ["preparingTime", "ASC"],
    ["createdAt", "DESC"],
  ],
};

// @desc   Browse all products across all restaurants
// @route  GET /api/store/products
// @access USER
exports.browseProducts = asyncHandler(async (req, res, next) => {
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let category = req.query.category || null;
  if (typeof category === "string") {
    try {
      category = JSON.parse(category);
    } catch {
      /* plain string, keep as is */
    }
  }
  const sort = req.query.sort || null;

  const whereClause = {};

  if (cursor) {
    whereClause.createdAt = { [Op.lt]: cursor };
  }

  if (category) {
    const categories = Array.isArray(category) ? category : [category];

    whereClause[Op.and] = Sequelize.literal(
      categories
        .map((cat) => `JSON_CONTAINS(category, '"${cat}"')`)
        .join(" OR "),
    );
  }

  const order = SORT_OPTIONS[sort] || [["createdAt", "DESC"]];

  const products = await Product.findAll({
    where: whereClause,
    order,
    limit,
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
    data: { products },
    nextCursor,
    results: products.length,
    errors: null,
  });
});
// @desc   Get single product detail
// @route  GET /api/store/products/:id
// @access USER
exports.getProductDetail = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    where: { id: req.params.id },
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

  if (!product) return next(new ApiError("Product not found", 404));

  res.status(200).json({
    status: "SUCCESS",
    message: "Product fetched successfully",
    data: { product },
    errors: null,
  });
});
