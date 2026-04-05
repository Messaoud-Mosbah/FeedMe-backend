const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const slugify = require("slugify");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ratingsAverage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    ratingsQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    restaurantProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    hooks: {
      beforeSave: (product) => {
        if (product.changed("title")) {
          product.slug = slugify(product.title, { lower: true, strict: true });
        }
      },
    },
  },
);

module.exports = Product;
