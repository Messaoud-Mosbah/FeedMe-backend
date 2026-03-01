const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const KITCHEN_TYPES = ["vegetarian", "Fast Food", "Deserts & Sweets", "Seafood", "Healthy Food", "Traditional dishes"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RestaurantProfile = sequelize.define("RestaurantProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true,
  },
  restaurantName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  businessEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
    },
  phoneNumber: {
    type: DataTypes.STRING(20), 
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: "restaurant-default.png",
  },
  city: { type: DataTypes.STRING(50) },
  wilaya: { type: DataTypes.STRING(50) },
  street: { type: DataTypes.STRING(50), allowNull: true },
  postalCode: {
    type: DataTypes.STRING(10), 
    allowNull: true,
  },
  googleMapsLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kitchenCategories: {
    type: DataTypes.JSON,
    validate: {
      isValidCategory(value) {
        if (!Array.isArray(value)) throw new Error("Must be an array");
        const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
        if (!isValid) throw new Error(`Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`);
      },
    },
  },
  openingHoursFrom: { type: DataTypes.TIME },
  openingHoursTo: { type: DataTypes.TIME },
  daysOpen: {
    type: DataTypes.JSON,
    validate: {
      isValidDay(value) {
        if (!Array.isArray(value)) throw new Error("Must be an array");
        const isValid = value.every((day) => DAYS_OF_WEEK.includes(day));
        if (!isValid) throw new Error(`Invalid day. Allowed: ${DAYS_OF_WEEK.join(", ")}`);
      },
    },
  },
  services: {
    type: DataTypes.JSON,
    defaultValue: { dineIn: false, takeaway: false, delivery: false, reservation: false },
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
}, {
  tableName: "restaurant_profiles",
  timestamps: true,
});

module.exports = RestaurantProfile;
