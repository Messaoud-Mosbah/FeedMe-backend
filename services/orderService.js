const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { Order, CartItem, Product, RestaurantProfile } = require("../models");

// @desc   place an order from a cart item
// @route  POST /api/orders
// @access USER
exports.placeOrder = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { cartItemId } = req.body;

  const cartItem = await CartItem.findOne({
    where: { id: cartItemId, userId },
  });
  if (!cartItem) return next(new ApiError("Cart item not found", 404));

  const order = await Order.create({
    userId,
    restaurantProfileId: cartItem.restaurantProfileId,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
  });

  await cartItem.destroy();

  res.status(201).json({
    status: "SUCCESS",
    message: "Order placed successfully",
    data: { order },
    errors: null,
  });
});

// @desc   get incoming orders for the logged-in restaurant
// @route  GET /api/orders/incoming
// @access RESTAURANT
exports.getIncomingOrders = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const orders = await Order.findAll({
    where: { restaurantProfileId: profile.id, status: "PENDING" },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "image", "price"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Pending orders fetched successfully",
    data: { results: orders.length, orders },
    errors: null,
  });
});
// @desc   get iaccepted  orders for the logged-in restaurant
// @route  GET /api/orders/incoming
// @access RESTAURANT
exports.getAcceptedOrders = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const orders = await Order.findAll({
    where: { restaurantProfileId: profile.id, status: "ACCEPTED" },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "image", "price"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Accepted orders fetched successfully",
    data: { results: orders.length, orders },
    errors: null,
  });
});

// @desc   update order status
// @route  PATCH /api/orders/:id/status
// @access RESTAURANT
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { status } = req.body;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const order = await Order.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });
  if (!order) return next(new ApiError("Order not found", 404));

  if (order.status !== "PENDING") {
    return next(new ApiError("Only PENDING orders can be accepted", 400));
  }

  order.status = "ACCEPTED";
  await order.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Order accepted",
    data: { order },
    errors: null,
  });
});
