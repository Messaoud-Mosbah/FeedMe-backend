const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const UserProfile = sequelize.define("UserProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
   phoneNumber: {
    type: DataTypes.STRING(20), 
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  profilePicture: {
    type: DataTypes.STRING(255),
    defaultValue: "default.png",
  },
  usageGoal:{
    type: DataTypes.JSON, 
    allowNull: true,
     },
  kitchenCategory: {
    type: DataTypes.JSON, 
    allowNull: true,
  },
  
  userId: {
    type: DataTypes.UUID, 
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'users_profiles',
  timestamps: true,
});

module.exports = UserProfile;