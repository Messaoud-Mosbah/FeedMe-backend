"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostMedia = require("./PostMedia");
const Product = require("./productModel");

if (
  !User ||
  !UserProfile ||
  !RestaurantProfile ||
  !Post ||
  !PostMedia ||
  !Product
) {
  console.error("تعذر تحميل أحد الموديلات، تأكد من مسارات الملفات!");
}

// ── User <=>UserProfile
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
// ── User <=> RestaurantProfile
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
// ── User <=> Post
User.hasMany(Post, {
  foreignKey: {
    name: "userId",
    type: DataTypes.UUID,
  },
  onDelete: "CASCADE",
});
Post.belongsTo(User, {
  foreignKey: "userId",
});
// ── Post <=> PostMedia
Post.hasMany(PostMedia, {
  foreignKey: {
    name: "postId",
    type: DataTypes.UUID,
  },
  onDelete: "CASCADE",
  as: "media",
});
PostMedia.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});
// ── RestaurantProfile <=> Product ───────────────────────────────
RestaurantProfile.hasMany(Product, {
  foreignKey: { name: "restaurantProfileId", type: DataTypes.UUID },
  onDelete: "CASCADE",
  as: "products",
});
Product.belongsTo(RestaurantProfile, {
  foreignKey: "restaurantProfileId",
  as: "restaurant",
});
module.exports = {
  sequelize,
  User,
  UserProfile,
  RestaurantProfile,
  Post,
  PostMedia,
  Product,
};
