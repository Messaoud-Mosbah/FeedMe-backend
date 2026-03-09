const { Post, PostImage, User, UserProfile } = require('../models/index')
const ApiError = require('../utils/apiError')

const createPost = async (userId, data, file) => {
  const mediaType = file
    ? file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO'
    : 'NONE'

  const post = await Post.create({
    caption: data.caption || null,
    contentType: data.contentType,
    mediaType,
    image: file && mediaType === 'IMAGE' ? file.path : null,
    video: file && mediaType === 'VIDEO' ? file.path : null,
    userId
  })

  return post
}

const getAllPosts = async () => {
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ['id'],
        include: [{
          model: UserProfile,
          attributes: ['fullName', 'profilePicture']
        }]
      }
    ],
    order: [['createdAt', 'DESC']]
  })
  return posts
}

const getMyPosts = async (userId) => {
  const posts = await Post.findAll({
    where: { userId },
    order: [
      ['isPinned', 'DESC'],
      ['createdAt', 'DESC']
    ]
  })
  return posts
}

const getOnePost = async (postId) => {
  const post = await Post.findOne({
    where: { id: postId },
    include: [
      {
        model: User,
        attributes: ['id'],
        include: [{
          model: UserProfile,
          attributes: ['fullName', 'profilePicture']
        }]
      }
    ]
  })

  if (!post) throw new ApiError('Post not found', 404)
  return post
}

const updatePost = async (postId, userId, data, file) => {
  const post = await Post.findOne({ where: { id: postId, userId } })

  if (!post) throw new ApiError('Post not found or not yours', 404)

  if (file) {
    const mediaType = file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO'
    data.mediaType = mediaType
    data.image = mediaType === 'IMAGE' ? file.path : null
    data.video = mediaType === 'VIDEO' ? file.path : null
  }

  await post.update(data)
  return post
}

const deletePost = async (postId, userId, role) => {
  const where = role === 'ADMIN'
    ? { id: postId }
    : { id: postId, userId }

  const post = await Post.findOne({ where })

  if (!post) throw new ApiError('Post not found or not yours', 404)

  await post.destroy()
}

const togglePin = async (postId, userId) => {
  const post = await Post.findOne({ where: { id: postId, userId } })

  if (!post) throw new ApiError('Post not found or not yours', 404)

  if (post.isPinned) {
    post.isPinned = false
  } else {
    await Post.update({ isPinned: false }, { where: { userId } })
    post.isPinned = true
  }

  await post.save()
  return { isPinned: post.isPinned }
}

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getOnePost,
  updatePost,
  deletePost,
  togglePin
}
