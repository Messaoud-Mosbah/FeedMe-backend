const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const {
  placeOrderValidator,
  updateOrderStatusValidator,
} = require("../utils/validators/orderValidator");
const {
  placeOrder,
  getIncomingOrders,
  getAcceptedOrders,
  updateOrderStatus,
} = require("../services/orderService");

// USER
router.post("/", protect, allwodTo("USER"), placeOrderValidator, placeOrder);

// RESTAURANT
router.get("/incoming", protect, allwodTo("RESTAURANT"), getIncomingOrders);
router.get("/accepted", protect, allwodTo("RESTAURANT"), getAcceptedOrders);
router.patch(
  "/:id/status",
  protect,
  allwodTo("RESTAURANT"),
  updateOrderStatusValidator,
  updateOrderStatus,
);

module.exports = router;
