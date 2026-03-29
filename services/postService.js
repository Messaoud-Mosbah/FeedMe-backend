const { Post, PostMedia, User, UserProfile } = require('../models')
const ApiError = require('../utils/apiError')
const asyncHandler = require('express-async-handler')
const { Op } = require("sequelize"); //operations  for sequelize : lt,gt,...




// ── CREATE ────────────────────────────
/**note : 
 * req.files and req.body yjou mn multer middleware in routes
 * 
console.log("Images:", images);
console.log("Video:", video);

لو رفع المستخدم صور فقط:

Images: [
  { fieldname: 'images', originalname: 'pizza.jpg', filename: '1719950200000-482938292.png', ... },
  { fieldname: 'images', originalname: 'burger.jpg', filename: '1719950200001-123456789.png', ... }
]
Video: undefined

لو رفع فيديو فقط:

Images: []
Video: { fieldname: 'video', originalname: 'reel.mp4', filename: '1719950200002-987654321.mp4', ... }

لو لم يرفع أي ملف:

Images: []
Video: undefined
 */

/**console.log(req.files);
 * 1️⃣ لو رفع المستخدم صور فقط
{
  images: [
    {
      fieldname: 'images',
      originalname: 'pizza.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: 'uploads/images',
      filename: '1719950200000-482938292.png',
      path: 'uploads/images/1719950200000-482938292.png',
      size: 34567
    },
    {
      fieldname: 'images',
      originalname: 'burger.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: 'uploads/images',
      filename: '1719950200001-123456789.png',
      path: 'uploads/images/1719950200001-123456789.png',
      size: 28945
    }
  ]
}
2️⃣ لو رفع الفيديو فقط
{
  video: [
    {
      fieldname: 'video',
      originalname: 'reel.mp4',
      encoding: '7bit',
      mimetype: 'video/mp4',
      destination: 'uploads/videos',
      filename: '1719950200002-987654321.mp4',
      path: 'uploads/videos/1719950200002-987654321.mp4',
      size: 2456789
    }
  ]
}
3️⃣ لو ما رفع حتى ملف
{}


 */


const createPost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || [] //get images
  const video  = req.files?.video?.[0]


   let mediaTypeValue = 'NONE';
if(images.length > 0) mediaTypeValue = 'IMAGE';
else if(video) mediaTypeValue = 'VIDEO';


  const { caption, contentType/*, mediaType*/ } = req.body

//create post
  const post = await Post.create({
    userId:      req.authenticatedUser.id, //= req.user.id 
    caption,
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


  // // ─── إذا كان Video  - field───
  // if (video) {

  //   await post.update({
  //     videoUrl: `/uploads/videos/${video.filename}`
  //   })
  // }


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
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

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
    data: posts,
    nextCursor,
    results: posts.length,
    errors: null,
  });
});






// ── GET MY POSTS (profile) ────────────

const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.authenticatedUser.id; // لازم middleware تضع req.user
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
    data: posts,
     nextCursor,
    results: posts.length,
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
        data: post,
        errors: null
    });
});


// ── UPDATE ────────────────────────────

const updatePost = asyncHandler(async(req,res,next)=>{

/**تعديل النص (caption, contentType)
تعديل نوع الميديا
تبديل الصور/الفيديو كامل */


 const {id} = req.params //postId

 const images = req.files?.images || [] //get images (array of images or empty array if no images) from multer if user uploads images
 const video  = req.files?.video?.[0] //get video (object of video or undefined if no video) from multer if user uploads video

 const {caption,contentType} = req.body //get new info

 const post = await Post.findByPk(id) //find post by id

 if(!post){
   throw new ApiError("Post not found",404)
 }

 if(post.userId !== req.user.id){ //the user is the own of post??
   throw new ApiError("Not authorized",403)
 }

 let mediaTypeValue = post.mediaType

 if(images.length > 0) mediaTypeValue = "IMAGE"
 else if(video) mediaTypeValue = "VIDEO"

 await post.update({
   caption: caption ?? post.caption,
   contentType: contentType ?? post.contentType,
   mediaType: mediaTypeValue
 })

 if(images.length > 0 || video){

   await Media.destroy({ //delete old media if exist
     where:{postId:post.id}
   })
   
   /**DELETE FROM media
WHERE postId = post.id */

   const mediaData = []

   if(images.length > 0){
 
     images.forEach((img,index)=>{ //loop on images to create mediaData array to insert in database
       mediaData.push({
         postId:post.id,
         type:"IMAGE",
         url:`/uploads/images/${img.filename}`,
         order:index
       })
     })

   }

   if(video){

     mediaData.push({
       postId:post.id,
       type:"VIDEO",
       url:`/uploads/videos/${video.filename}`,
       order:0
     })

   }

   await PostMedia.bulkCreate(mediaData)

 }

 res.status(200).json({
   status:"SUCCESS",
   message:"Post updated successfully",
   data:{post},
   errors:null
 })

})


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
    where: { id: req.params.postId, userId: req.user.id }
  })

  if (!post) throw new ApiError('Post not found or not yours', 404)

  if (post.isPinned) {
    post.isPinned = false
  } else {
    await Post.update({ isPinned: false }, { where: { userId: req.user.id } })
    post.isPinned = true
  }

  await post.save()

  res.status(200).json({
    status:  'SUCCESS',
    message: post.isPinned ? 'Post pinned' : 'Post unpinned',
    data:    { isPinned: post.isPinned }
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


