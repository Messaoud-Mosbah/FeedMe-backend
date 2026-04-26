const express = require("express");
const router = express.Router();

// الخدمات والكنترولرات
const postService = require("../services/postService");
const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const upload = require("../middlewares/uploadMiddleware");
// const { toggleLike } = require("../controllers/likeController");
// const { createComment, getProductComments, deleteComment } = require("../controllers/commentController");

// الـ Validators
const {
  validateCreatePost,
  validateUpdatePost,
  validateGetPosts,
  validateidpost,
} = require("../utils/validators/postValidation");
const { createCommentValidator } = require("../utils/validators/commentValidator");

// ── 1. مسارات المنشورات (Posts) ──────────────────────────────────
router.route("/")
  .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateGetPosts, postService.getAllPosts)
  .post(
    protect, 
    allwodTo("USER", "RESTAURANT", "ADMIN"), 
    upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }]), 
    validateCreatePost, 
    postService.createPost
  );

;router.get("/pin/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.togglePin);

router.route("/:id")
  .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.getOnePost)
  .patch(
    protect, 
    allwodTo("USER", "RESTAURANT", "ADMIN"), 
    upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }]), 
    validateUpdatePost, 
    postService.updatePost
  )
  .delete(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.deletePost);


// ── 2. مسارات التفاعل (Likes & Comments) ──────────────────────────

// التفضيل (Like) - تم تغيير المسار لتجنب التضارب
// router.patch("/:postId/toggle-like", protect, toggleLike);

// // التعليقات (Comments)
// router.route("/:postId/comments")
//   .post(protect, createCommentValidator, createComment)
//   .get(getProductComments);

// router.delete("/:postId/comments/:commentId", protect, deleteComment);

module.exports = router;