const { Post, PostMedia, User, UserProfile } = require('../models')
const ApiError = require('../utils/apiError')
const asyncHandler = require('express-async-handler')
const { Op } = require("sequelize");
const {sequelize} = require("../config/database");





const createPost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || [] //get images
  const video  = req.files?.video?.[0]


   let mediaTypeValue = 'NONE';
if(images.length > 0) mediaTypeValue = 'IMAGE';
else if(video) mediaTypeValue = 'VIDEO';


  const { title ,description, contentType/*, mediaType*/ } = req.body

//create post
  const post = await Post.create({
    userId:req.authenticatedUser.id, //= req.user.id 
title,
description,
    contentType: contentType || 'DISH',
    mediaType: mediaTypeValue,
  //  video:       video ? video.path : null,
  })


  const mediaData = [];

  if (images.length > 0) {
    images.forEach((img, index) => {
      mediaData.push({
        postId: post.id, //PostId FK
        type: "IMAGE",
        url: `/uploads/images/${img.filename}`,  //img.filename => اسم الملف اللي تم تخزينه في السيرفر par multer
        order: index
      });
    });
  }

  if (video) {
    mediaData.push({
      postId: post.id,
      type: "VIDEO",
      url: `/uploads/videos/${video.filename}`,
      order: 0
    });
  }


   // حفظ media في database
  if (mediaData.length > 0) {
    await PostMedia.bulkCreate(mediaData); //insert many rows in same time
  }


  res.status(201).json({
    status:  'SUCCESS',
    message: 'Post created successfully',
    data:    { post },
    errors:null

  })
})



// get all posts with cursor pagination
const getAllPosts = asyncHandler(async (req, res) => {
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null; 
  //give me posts that its created time less than cursor

  const limit = req.query.limit ? parseInt(req.query.limit) : 50;

  // query posts
  let whereClause = {};
  if (cursor) {
  whereClause.createdAt = { [Op.lt]: cursor };// posts less than cursor
  }
//page 1 (first time)-> whereClause = {}
//page 2 (second) -> whereClause = { createdAt: { $lt: "2024-01-15" } }

  const posts = await Post.findAll({
    where: whereClause,// posts less than cursor
    order: [["createdAt", "DESC"]], //ordre desc
    limit, //juste n=limit post
    include: [
      { model: PostMedia, as: "media" },
      {
        model: User,
        attributes: ['id', 'userName'],
        include: [{
          model: UserProfile,
          attributes: ['fullName', 'profilePicture']
        }]
      }
    ], // join media and user info
  });

  // set nextCursor for front-end
  let nextCursor = null;
  if (posts.length > 0) {
    nextCursor = posts[posts.length - 1].createdAt; //la date de création du dernier post dans la liste posts
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "Posts fetched successfully",
    data: {
    results: posts.length,
    nextCursor,

      posts},
    errors: null,
  });
});






// ── GET MY POSTS (profile) ────────────

const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.authenticatedUser.id; 
 const cursor = req.query.cursor ? new Date(req.query.cursor) : null; 
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;


  const whereCondition = { userId };

  if (cursor) {
    whereCondition.createdAt = {
      [Op.lt]: cursor
    };
  }
/**whereCondition = {
  userId: 5,
  createdAt: {
    [Op.lt]: "2026-03-25T10:00:00.000Z"
  }
} */
  const posts = await Post.findAll({
    where: whereCondition,//appliquer les conditions de cursor et userId
    limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: PostMedia,
        as: "media",
        attributes: ["id", "url", "type", "order"] //return just this feild from table media 
      }
    ]
  });

  // nextCursor,for given to front end
  const nextCursor = posts.length ? posts[posts.length - 1].createdAt : null;//if does not exist post -> nextCursor = null

  res.status(200).json({
    status: "SUCCESS",
    message: "My posts fetched successfully",
    data: {
    results: posts.length,
    nextCursor,

      posts},
    errors: null
  });
});



// ── GET ONE ───────────────────────────
const getOnePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params; //postId in route /api/posts/:id => req.params.id from front

    // Récupérer le post + media associé
    const post = await Post.findByPk(id, {
        include: { model: PostMedia, as: 'media' }
    });

    if (!post) {
        throw new ApiError('Post not found', 404);
    }

    res.status(200).json({
        status: 'SUCCESS',
        message: 'Post retrieved successfully',
        data: {post},
        errors: null
    });
});


// ── UPDATE ────────────────────────────
const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, contentType, keptMediaIds } = req.body; 
  const images = req.files?.images || [];
  const video = req.files?.video?.[0];

  const post = await Post.findByPk(id);
  if (!post) throw new ApiError("Post not found", 404);
  if (post.userId !== req.authenticatedUser.id) throw new ApiError("Not authorized", 403);

  const transaction = await sequelize.transaction();

  try {
    await post.update({
      title: title ?? post.title,
      description: description ?? post.description,
      contentType: contentType ?? post.contentType,
    }, { transaction });

  // 1. تأكد من أن الـ keptIds هي مصفوفة من النصوص (UUIDs)
const keptIds = keptMediaIds ? JSON.parse(keptMediaIds) : [];

// 2. استخدام التعديل التالي لتجنب مشاكل MySQL مع UUID
await PostMedia.destroy({
  where: {
    postId: post.id,
    id: { 
      [Op.notIn]: keptIds.length > 0 ? keptIds : ['NULL_PLACEHOLDER'] 
    }
  },
  transaction
});

    const mediaData = [];
    images.forEach((img, index) => {
      mediaData.push({ 
        postId: post.id, 
        type: "IMAGE", 
        url: `/uploads/images/${img.filename}`, 
        order: keptIds.length + index 
      });
    });

    if (video) {
      mediaData.push({ 
        postId: post.id, 
        type: "VIDEO", 
        url: `/uploads/videos/${video.filename}`, 
        order: 0 
      });
    }

    if (mediaData.length > 0) {
      await PostMedia.bulkCreate(mediaData, { transaction });
    }

const remainingImagesCount = await PostMedia.count({ 
  where: { 
    postId: post.id, 
    type: 'IMAGE' 
  }, 
  transaction 
});

const remainingVideosCount = await PostMedia.count({ 
  where: { 
    postId: post.id, 
    type: 'VIDEO' 
  }, 
  transaction 
});    
let newMediaType = "NONE";

if (remainingImagesCount > 0 ) {
    newMediaType = "IMAGE";

} else if (remainingVideosCount > 0) {
    newMediaType = "VIDEO";
}else{
      newMediaType = "NONE";
}

await post.update({ mediaType: newMediaType }, { transaction });
    await transaction.commit();

    res.status(200).json({ status: "SUCCESS", message: "Post updated successfully", data: { post } });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// ── DELETE ────────────────────────────

const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //postId in route /api/posts/:id => req.params.id from front

  const post = await Post.findByPk(id);
  if (!post) throw new ApiError("Post not found", 404);

  await post.destroy(); //supprime post + cascade delete media

  res.status(200).json({
    status: "SUCCESS",
    message: "Post deleted successfully",
    data: null,
    errors: null,
  });
});

// ── PIN TOGGLE ────────────────────────
const togglePin = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    where: { id: req.params.id, userId: req.authenticatedUser.id }
  })

  if (!post) throw new ApiError('Post not found or not yours', 404)

  if (post.isPinned) {
    post.isPinned = false
  } else {
    await Post.update({ isPinned: false }, { where: { userId: req.authenticatedUser.id } })
    post.isPinned = true
  }

  await post.save()

  res.status(200).json({
    status:  'SUCCESS',
    message: post.isPinned ? 'Post pinned' : 'Post unpinned',
    data:    {  post }
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


