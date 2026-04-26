const asyncHandler = require("express-async-handler");
const Like = require("../models/likeModel");
const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const { productId } = req.params;

  const existingLike = await Like.findOne({ where: { userId, productId } });

  let action = "";
  if (existingLike) {
    await existingLike.destroy();
    action = "unliked";
  } else {
    await Like.create({ userId, productId });
    action = "liked";
  }

  const updatedProduct = await Product.findByPk(productId, {
    attributes: ['id', 'likesCount'] 
  });

  if (!updatedProduct) {
    return next(new ApiError("Product not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: `Product ${action} successfully`,
    data: {
      productId: updatedProduct.id,
      likesCount: updatedProduct.likesCount,
      isLiked: action === "liked" 
    }
  });
});