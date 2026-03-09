const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middlewares/authMiddleware')
const allowedTo = require('../middlewares/allowedTo')
const upload = require('../middlewares/uploadMiddleware')
const { validateCreatePost, validateUpdatePost } = require('../middlewares/validators/postValidator')

// ── GET ALL (feed) ────────────────────
router.get(
  '/',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT', 'ADMIN'),
  postController.getAllPosts
)

// ── GET MY POSTS (profile) ────────────
router.get(
  '/me',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT', 'ADMIN'),
  postController.getMyPosts
)

// ── GET ONE ───────────────────────────
router.get(
  '/:postId',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT', 'ADMIN'),
  postController.getOnePost
)

// ── CREATE ────────────────────────────
router.post(
  '/',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT'),
  upload.single('media'),
  validateCreatePost,
  postController.createPost
)

// ── UPDATE ────────────────────────────
router.put(
  '/:postId',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT'),
  upload.single('media'),
  validateUpdatePost,
  postController.updatePost
)

// ── DELETE ────────────────────────────
router.delete(
  '/:postId',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT', 'ADMIN'),
  postController.deletePost
)

// ── PIN TOGGLE ────────────────────────
router.patch(
  '/:postId/pin',
  authMiddleware,
  allowedTo('USER', 'RESTAURANT'),
  postController.togglePin
)

module.exports = router