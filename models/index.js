const User = require('./userModel');
const RestaurantProfile = require('./restaurantProfileModel');

// 1. المستخدم يمتلك بروفايل مطعم واحد
User.hasOne(RestaurantProfile, {
  foreignKey: 'userId', // اسم العمود في جدول المطعم الذي يشير للمستخدم
  onDelete: 'CASCADE',  // إذا حُذف المستخدم، يُحذف بروفايل مطعمه تلقائياً
});

// 2. بروفايل المطعم ينتمي لمستخدم واحد
RestaurantProfile.belongsTo(User, {
  foreignKey: 'userId',
    onDelete: 'CASCADE',
});