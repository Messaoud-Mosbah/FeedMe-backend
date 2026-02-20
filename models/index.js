const User = require('./userModel');
const RestaurantProfile = require('./restaurantProfileModel');

User.hasOne(RestaurantProfile, {
  foreignKey: 'userId', 
  onDelete: 'CASCADE',  
});

RestaurantProfile.belongsTo(User, {
  foreignKey: 'userId',
    onDelete: 'CASCADE',
});