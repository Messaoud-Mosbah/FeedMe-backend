const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const {
  Order,
  OrderItem,
  CartItem,
  Product,
  RestaurantProfile,
} = require("../models");

// @desc   Place order for all cart items from a restaurant
// @route  POST /api/orders
// @access USER
exports.placeOrder = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { restaurantProfileId } = req.body;

  // get all cart items for this user + restaurant
  const cartItems = await CartItem.findAll({
    where: { userId, restaurantProfileId },
  });

  if (!cartItems.length)
    return next(new ApiError("No cart items found for this restaurant", 404));

  // create the order
  const order = await Order.create({ userId, restaurantProfileId });

  // create order items from cart items
  const orderItemsData = cartItems.map((item) => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
  }));

  await OrderItem.bulkCreate(orderItemsData);

  // clear those cart items
  await CartItem.destroy({ where: { userId, restaurantProfileId } });

  // return order with items
  const fullOrder = await Order.findByPk(order.id, {
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
    ],
  });

  res.status(201).json({
    status: "SUCCESS",
    message: "Order placed successfully",
    data: { order: fullOrder },
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
    })),
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "Pending orders fetched successfully",
    data: { results: items.length, items },
    errors: null,
  });
});
// @desc   Get accepted orders for the logged-in restaurant
// @route  GET /api/orders/accepted
// @access RESTAURANT
exports.getAcceptedOrders = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) return next(new ApiError("Restaurant profile not found", 404));

  const orders = await Order.findAll({
    where: { restaurantProfileId: profile.id, status: "ACCEPTED" },
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
    })),
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "Accepted orders fetched successfully",
    data: { results: items.length, items },
    errors: null,
  });
});

// @desc   Accept an order
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
