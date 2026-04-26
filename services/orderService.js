const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");

const {
  Order,
  OrderItem,
  CartItem,
  Product,
  RestaurantProfile,
  User,
  UserProfile,
} = require("../models");

exports.placeOrder = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { restaurantProfileId } = req.body;

  const cartItems = await CartItem.findAll({
    where: { userId, restaurantProfileId },
  });

  if (!cartItems.length)
    return next(new ApiError("No cart items found for this restaurant", 404));

  // ✅ أوردر منفصل لكل منتج
  const orders = [];
  for (const item of cartItems) {
    const order = await Order.create({ userId, restaurantProfileId });
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
    });
    orders.push(order);
  }

  await CartItem.destroy({ where: { userId, restaurantProfileId } });

  res.status(201).json({
    status: "SUCCESS",
    message: "Orders placed successfully",
    data: { orders },
    errors: null,
  });
});
// @desc   Get incoming (PENDING) orders for the logged-in restaurant
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
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "image", "price"],
          },
        ],
      },
      {
        model: User,
        attributes: ["id", "userName"],
        include: [
          {
            model: UserProfile,
            attributes: ["profilePicture", "fullName"],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  const items = orders.flatMap((order) =>
    order.items.map((item) => ({
      orderId: order.id,
      orderItemId: item.id,
      status: order.status,
      createdAt: order.createdAt,
      product: item.product,
      quantity: item.quantity,
      user: {
        id: order.User?.id,
        userName: order.User?.userName,
        fullName: order.User?.UserProfile?.fullName || null,
        avatar: order.User?.UserProfile?.profilePicture || null,
      },
    }))
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "Pending orders fetched successfully",
    data: { results: items.length, items },
    errors: null,
  });
});

exports.getAcceptedOrders = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const oneHourAgo = new Date(Date.now() - 10 * 60 * 1000);

  const orders = await Order.findAll({
    where: {
      restaurantProfileId: profile.id,
      status: "ACCEPTED",
      updatedAt: { [Op.gte]: oneHourAgo },
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "image", "price"],
          },
        ],
      },
      {
        model: User,
        attributes: ["id", "userName"],
        include: [
          {
            model: UserProfile,
            attributes: ["profilePicture", "fullName"],
          },
        ],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  const items = orders.flatMap((order) =>
    order.items.map((item) => ({
      orderId: order.id,
      orderItemId: item.id,
      status: order.status,
      createdAt: order.createdAt,
      product: item.product,
      quantity: item.quantity,
      user: {
        id: order.User?.id,
        userName: order.User?.userName,
        fullName: order.User?.UserProfile?.fullName || null,
        avatar: order.User?.UserProfile?.profilePicture || null,
      },
    }))
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "Accepted orders fetched successfully",
    data: { results: items.length, items },
    errors: null,
  });
}); // @desc   Accept an order
// @route  PATCH /api/orders/:id/status
// @access RESTAURANT
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const order = await Order.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });
  if (!order) return next(new ApiError("Order not found", 404));

  if (order.status !== "PENDING")
    return next(new ApiError("Only PENDING orders can be accepted", 400));

  order.status = "ACCEPTED";
  await order.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Order accepted",
    data: { order },
    errors: null,
  });
});

// @desc   Reject an order
// @route  DELETE /api/orders/:id
// @access RESTAURANT
exports.rejectOrder = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const order = await Order.findOne({
    where: { id: req.params.id, restaurantProfileId: profile.id },
  });
  if (!order) return next(new ApiError("Order not found", 404));

  if (order.status !== "PENDING")
    return next(new ApiError("Only PENDING orders can be rejected", 400));

  await order.destroy();

  res.status(200).json({
    status: "SUCCESS",
    message: "Order rejected successfully",
    data: null,
    errors: null,
  });
});
