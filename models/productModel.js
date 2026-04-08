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
    name: {
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
    preparingTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
        if (product.changed("name")) {
          product.slug = slugify(product.name, { lower: true, strict: true });
        }
      },
    },
  },
);

module.exports = Product;
