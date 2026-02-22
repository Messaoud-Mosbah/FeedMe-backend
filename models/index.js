const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");

User.hasOne(UserProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
UserProfile.belongsTo(User, {
  foreignKey: "userId",
});

User.hasOne(RestaurantProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

RestaurantProfile.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

module.exports = {
  User,
  UserProfile,
  RestaurantProfile,
};
