"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostMedia = require("./PostMedia");
const Product = require("./productModel");
const CartItem = require("./cartModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");
if (
  !User ||
  !UserProfile ||
  !RestaurantProfile ||
  !Post ||
  !PostMedia ||
  !Product ||
  !CartItem ||
  !Order ||
  !OrderItem
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

// User <=> CartItem
User.hasMany(CartItem, {
  foreignKey: { name: "userId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
CartItem.belongsTo(User, { foreignKey: "userId" });

// Product <=> CartItem
Product.hasMany(CartItem, {
  foreignKey: { name: "productId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
CartItem.belongsTo(Product, { foreignKey: "productId" });

// RestaurantProfile <=> CartItem
RestaurantProfile.hasMany(CartItem, {
  foreignKey: { name: "restaurantProfileId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
CartItem.belongsTo(RestaurantProfile, {
  foreignKey: "restaurantProfileId",
  as: "restaurant",
});
// User <=> Order
User.hasMany(Order, {
  foreignKey: { name: "userId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
Order.belongsTo(User, { foreignKey: "userId" });

// RestaurantProfile <=> Order
RestaurantProfile.hasMany(Order, {
  foreignKey: { name: "restaurantProfileId", type: DataTypes.UUID },
  onDelete: "CASCADE",
});
Order.belongsTo(RestaurantProfile, {
  foreignKey: "restaurantProfileId",
  as: "restaurant",
});

// Order <=> OrderItem
Order.hasMany(OrderItem, {
  foreignKey: { name: "orderId", type: DataTypes.UUID },
  onDelete: "CASCADE",
  as: "items",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product <=> OrderItem
Product.hasMany(OrderItem, {
  foreignKey: { name: "productId", type: DataTypes.UUID },
  onDelete: "SET NULL",
});
OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});
module.exports = {
  sequelize,
  User,
  UserProfile,
  RestaurantProfile,
  Post,
  PostMedia,
  Product,
  CartItem,
  Order,
  OrderItem,
};
