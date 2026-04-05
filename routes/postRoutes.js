const express = require("express");
const router = express.Router();
const postService = require("../services/postService");
const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const upload = require("../middlewares/uploadMiddleware");
const {
  validateCreatePost,
  validateUpdatePost,
  validateGetPosts,
  validateidpost,
} = require("../utils/validators/postValidation");

//route :  /api/posts

router.get(
  "/",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"),
  validateGetPosts,
  postService.getAllPosts,
);
router.get(
  "/my-posts",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"),
  validateGetPosts,
  postService.getMyPosts,
);
router.get(
  "/:id",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"),
  validateidpost,
  postService.getOnePost,
); //id = postId

//create post
router.post(
  "/",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"), //token -> protect -> faute ici
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]), //upload middleware
  validateCreatePost, //vérifie req.body (caption, contentType, mediaType) + vérifie que images et video ne sont pas ensemble
  postService.createPost,
);

router.delete(
  "/:id",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"),
  validateidpost,
  postService.deletePost,
);
router.patch(
  "/:id",
  protect,
  allwodTo("USER", "RESTAURANT", "ADMIN"),
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]), //upload middleware
  validateUpdatePost,
  postService.updatePost,
);

module.exports = router;
