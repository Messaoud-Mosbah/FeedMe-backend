const postService = require('../services/postService')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/apiError')

// ── CREATE ────────────────────────────
const createPost = asyncHandler(async (req, res, next) => {
  const post = await postService.createPost(req.user.id, req.body, req.file)
  res.status(201).json({
    status: 'SUCCESS',
    message: 'Post created successfully',
    data: { post }
  })
})

// ── GET ALL (feed) ────────────────────
const getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await postService.getAllPosts()
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Posts fetched successfully',
    data: { posts }
  })
})

// ── GET MY POSTS (profile) ────────────
const getMyPosts = asyncHandler(async (req, res, next) => {
  const posts = await postService.getMyPosts(req.user.id)
  res.status(200).json({
    status: 'SUCCESS',
    message: 'My posts fetched successfully',
    data: { posts }
  })
})

// ── GET ONE ───────────────────────────
const getOnePost = asyncHandler(async (req, res, next) => {
  const post = await postService.getOnePost(req.params.postId)
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Post fetched successfully',
    data: { post }
  })
})

// ── UPDATE ────────────────────────────
const updatePost = asyncHandler(async (req, res, next) => {
  const post = await postService.updatePost(
    req.params.postId,
    req.user.id,
    req.body,
    req.file
  )
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Post updated successfully',
    data: { post }
  })
})

// ── DELETE ────────────────────────────
const deletePost = asyncHandler(async (req, res, next) => {
  await postService.deletePost(
    req.params.postId,
    req.user.id,
    req.user.role
  )
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Post deleted successfully',
    data: null
  })
})

// ── PIN TOGGLE ────────────────────────
const togglePin = asyncHandler(async (req, res, next) => {
  const result = await postService.togglePin(req.params.postId, req.user.id)
  res.status(200).json({
    status: 'SUCCESS',
    message: result.isPinned ? 'Post pinned' : 'Post unpinned',
    data: { isPinned: result.isPinned }
  })
})

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getOnePost,
  updatePost,
  deletePost,
  togglePin
}