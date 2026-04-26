const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { CartItem, Product,User, RestaurantProfile } = require("../models");

const SERVER_BASE_URL = "http://localhost:8000";

const formatImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${SERVER_BASE_URL}/${cleanPath}`;
};

//-------------1------------
// @desc    Get cart of logged-in user
// @route   GET /api/cart
exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        include: [
          {
            model: RestaurantProfile,
            as: "restaurant",
            attributes: ["id", "restaurantName", "restaurantLogoUrl"],
            include: [{ model: User, attributes: ["userName"] }],
          },
        ],
      },
    ],
  });

  const grouped = {};

  cartItems.forEach((item) => {
    const product = item.Product;
    if (!product) return;

    const restaurantId = product.restaurantProfileId;
    const restaurantData = product.restaurant;
    const userData = restaurantData?.User; 

    if (!grouped[restaurantId]) {
      grouped[restaurantId] = {
        accountId: restaurantId,
        accountName: restaurantData?.restaurantName || "Unknown Restaurant",
        userName: userData?.userName || "unknown_user",
        accountAvatar: formatImageUrl(restaurantData?.restaurantLogoUrl) || "/default-avatar.png",
        items: [],
        restaurantTotal: 0,
      };
    }

    const price = parseFloat(product.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const totalPrice = price * quantity;

    grouped[restaurantId].items.push({
      id: product.id,
      productName: product.name,
      price: price,
      description: product.description,
      // استخدام الدالة هنا
      image: formatImageUrl(product.image),
      qty: quantity,
      accountId: restaurantId,
      userId:userId
    });

    const currentTotal = parseFloat(grouped[restaurantId].restaurantTotal);
    grouped[restaurantId].restaurantTotal = (currentTotal + totalPrice).toFixed(2);
  });

  const allCartGroups = Object.values(grouped);

  res.status(200).json({
    status: "SUCCESS",
    message: "Cart fetched successfully",
    data: { allCartGroups },
    errors: null,
  });
});

//---------------2--------------
// @desc    Add item to cart
// @route   POST /api/cart
// @access  USER
exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { productId } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) return next(new ApiError("Product not found", 404));

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

//---------------3--------------
// @desc   Update cart item quantity
// @route  PATCH /api/cart/:itemId
// @access USER
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { quantity} = req.body;
  const {itemId }=req.params;
  if (!itemId) {
}

 const cartItem = await CartItem.findOne({
  where: { 
    productId:itemId,
    userId: userId
  },
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

//----------------4------------
// @desc   Remove one item from cart
// @route  DELETE /api/cart/:itemId
// @access USER
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;

  const cartItem = await CartItem.findOne({
    where: { productId: req.params.itemId, userId },
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


//-------------------5-------------
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
