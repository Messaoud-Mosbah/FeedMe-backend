'use strict';

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");
const Post = require("./postModel");
const PostMedia = require("./PostMedia");

if (!User || !UserProfile || !RestaurantProfile || !Post || !PostMedia) {
    console.error("تعذر تحميل أحد الموديلات، تأكد من مسارات الملفات!");
}


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

Post.hasMany(PostMedia, {
    foreignKey: {
        name: "postId",
        type: DataTypes.UUID,
    },
    onDelete: "CASCADE",
    as: "media"
});
PostMedia.belongsTo(Post, {
    foreignKey: "postId",
    as: "post"
});

module.exports = {
    sequelize,
    User,
    UserProfile,
    RestaurantProfile,
    Post,
    PostMedia
};