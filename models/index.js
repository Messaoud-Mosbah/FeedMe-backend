const { DataTypes } = require("sequelize"); 
const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostImage = require("./postImageModel");
// ── USER ──────────────────────────────
User.hasOne(UserProfile, {
  foreignKey: {
    name: "userId",
    type: DataTypes.UUID, 
  },
  onDelete: "CASCADE",
});
UserProfile.belongsTo(User, {
  foreignKey: "userId",
});

User.hasOne(RestaurantProfile, {
  foreignKey: {
    name: "userId",
    type: DataTypes.UUID,
  },
  onDelete: "CASCADE",
});
RestaurantProfile.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});


// ── POSTS ──────────────//one user - N posts

User.hasMany(Post, {  
  foreignKey: { name: "userId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
Post.belongsTo(User, { foreignKey: "userId" });


// ── POST IMAGES ──────one post - N images─────────────────
Post.hasMany(PostImage, {
  foreignKey: { name: "postId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
PostImage.belongsTo(Post, { foreignKey: "postId" });




module.exports = {
  User,
  UserProfile,
  RestaurantProfile,
  Post,
  PostImage
};