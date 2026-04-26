const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

// 1. إنشاء تعليق جديد
exports.createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    text: req.body.text,
    userId: req.authenticatedUser.id,
    productId: req.params.productId
  });
  
  res.status(201).json({ status: "SUCCESS", data: comment });
});

// 2. جلب جميع تعليقات المنتج
exports.getProductComments = asyncHandler(async (req, res) => {
  const comments = await Comment.findAll({
    where: { productId: req.params.productId },
    include: [{ 
      model: User, 
      attributes: ['userName', 'profilePicture'] 
    }],
    order: [['createdAt', 'DESC']] // الأحدث يظهر أولاً
  });
  
  res.status(200).json({ status: "SUCCESS", results: comments.length, data: comments });
});

// 3. حذف تعليق (مع التحقق من الملكية)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.authenticatedUser.id;

  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    return next(new ApiError("Comment not found", 404));
  }

  // التحقق: هل المستخدم هو صاحب التعليق؟
  if (comment.userId !== userId) {
    return next(new ApiError("You are not allowed to perform this action", 403));
  }

  await comment.destroy(); // سيقوم الـ Hook بتنقيص الـ commentsCount تلقائياً

  res.status(200).json({ status: "SUCCESS", message: "Comment deleted successfully" });
});