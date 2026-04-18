const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { CartItem, Product, RestaurantProfile } = require("../models");

// @desc   Get cart of logged-in user
// @route  GET /api/cart
// @access USER
exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        attributes: [
          "id",
          "name",
          "image",
          "price",
          "preparingTime",
          "description",
        ],
      },
      {
        model: RestaurantProfile,
        as: "restaurant",
        attributes: ["id", "restaurantName", "restaurantLogoUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // group by restaurant
  const grouped = {};

  cartItems.forEach((item) => {
    const restaurantId = item.restaurantProfileId;

    if (!grouped[restaurantId]) {
      grouped[restaurantId] = {
        restaurant: item.restaurant,
        items: [],
        restaurantTotal: 0,
      };
    }

    const totalPrice = (item.Product.price * item.quantity).toFixed(2);

    grouped[restaurantId].items.push({
      cartItemId: item.id,
      product: item.Product,
      quantity: item.quantity,
      totalPrice,
    });

    grouped[restaurantId].restaurantTotal = (
      parseFloat(grouped[restaurantId].restaurantTotal) + parseFloat(totalPrice)
    ).toFixed(2);
  });

  const restaurants = Object.values(grouped);

  const cartTotal = restaurants
    .reduce((sum, r) => sum + parseFloat(r.restaurantTotal), 0)
    .toFixed(2);

  res.status(200).json({
    status: "SUCCESS",
    message: "Cart fetched successfully",
    data: { results: restaurants.length, cartTotal, restaurants },
    errors: null,
  });
});

// @desc   Add item to cart
// @route  POST /api/cart
// @access USER
exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { productId } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) return next(new ApiError("Product not found", 404));

  // check if already in cart
  const existing = await CartItem.findOne({ where: { userId, productId } });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
    return res.status(200).json({
      status: "SUCCESS",
      message: "Quantity updated",
      data: { cartItem: existing },
      errors: null,
    });
  }

  const cartItem = await CartItem.create({
    userId,
    productId,
    restaurantProfileId: product.restaurantProfileId,
    quantity: 1,
  });

  res.status(201).json({
    status: "SUCCESS",
    message: "Product added to cart",
    data: { cartItem },
    errors: null,
  });
});

// @desc   Update cart item quantity
// @route  PATCH /api/cart/:itemId
// @access USER
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { quantity } = req.body;

  const cartItem = await CartItem.findOne({
    where: { id: req.params.itemId, userId },
  });
  if (!cartItem) return next(new ApiError("Cart item not found", 404));

  cartItem.quantity = quantity;
  await cartItem.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Cart item updated",
    data: { cartItem },
    errors: null,
  });
});

// @desc   Remove one item from cart
// @route  DELETE /api/cart/:itemId
// @access USER
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const cartItem = await CartItem.findOne({
    where: { id: req.params.itemId, userId },
  });
  if (!cartItem) return next(new ApiError("Cart item not found", 404));

  await cartItem.destroy();

  res.status(200).json({
    status: "SUCCESS",
    message: "Cart item removed",
    data: null,
    errors: null,
  });
});

// @desc   Clear entire cart
// @route  DELETE /api/cart
// @access USER
exports.clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  await CartItem.destroy({ where: { userId } });

  res.status(200).json({
    status: "SUCCESS",
    message: "Cart cleared",
    data: null,
    errors: null,
  });
});
