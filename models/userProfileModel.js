const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserProfile = sequelize.define("UserProfile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(50),
    allowNull: false, // من صورة Basic information
  },
  profilePicture: {
    type: DataTypes.STRING(50),
    defaultValue: "default.png",
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true, // اختياري حسب الصورة
  },
  phone: {
    type: DataTypes.INTEGER(20),
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true, // اختياري
  },
  // حقول التفضيلات (Preferences) من الصورة الثانية
  usagePreferences: {
    type: DataTypes.JSON, // لتخزين مصفوفة مثل ["Follow healthy food", "Write reviews"]
    allowNull: true,
  },
  kitchenCategories: {
    type: DataTypes.JSON, // لتخزين مصفوفة مثل ["Vegetarian", "Seafood"]
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
});

module.exports = UserProfile;