const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const KITCHEN_TYPES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RestaurantProfile = sequelize.define("RestaurantProfile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  restaurantName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  businessEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.INTEGER(20),
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: "restaurant-default.png",
  },

  city: {
    type: DataTypes.STRING(50),
  },
  wilaya: {
    type: DataTypes.STRING(50),
  },
  street: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  postalCode: {
    type: DataTypes.INTEGER(20),
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
        const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
        if (!isValid) {
          throw new Error(
            `Invalid kitchen category. Allowed: ${KITCHEN_TYPES.join(", ")}`,
          );
        }
      },
    },
  },
  openingHoursFrom: {
    type: DataTypes.TIME,
  },
  openingHoursTo: {
    type: DataTypes.TIME,
  },
  daysOpen: {
    type: DataTypes.JSON,
    validate: {
      isValidDay(value) {
        const isValid = value.every((day) => DAYS_OF_WEEK.includes(day));
        if (!isValid) {
          throw new Error(`Invalid day. Allowed: ${DAYS_OF_WEEK.join(", ")}`);
        }
      },
    },
  },
  services: {
    type: DataTypes.JSON,
    defaultValue: {
      dineIn: false,
      takeaway: false,
      delivery: false,
      reservation: false,
    },
  },

  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: "users",
      key: "id",
    },
  },
});

module.exports = RestaurantProfile;
