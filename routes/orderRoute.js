const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const { placeOrderValidator } = require("../utils/validators/orderValidator");
const {
  placeOrder,
  getIncomingOrders,
  getAcceptedOrders,
  updateOrderStatus,
  rejectOrder,
} = require("../services/orderService");

// USER
router.post("/", protect, allwodTo("USER"), placeOrderValidator, placeOrder);

// RESTAURANT
router.get("/incoming", protect, allwodTo("RESTAURANT"), getIncomingOrders);
router.get("/accepted", protect, allwodTo("RESTAURANT"), getAcceptedOrders);
router.patch("/:id/status", protect, allwodTo("RESTAURANT"), updateOrderStatus);
router.delete("/:id", protect, allwodTo("RESTAURANT"), rejectOrder);

module.exports = router;