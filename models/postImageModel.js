const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const PostImage = sequelize.define(
  "PostImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false, // chemin de l'image
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // ordre d'affichage
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      // pas de references ici → c'est dans migration + index.js
    },
  },
  {
    tableName: "posts_images",
    timestamps: true,
  }
);

module.exports = PostImage;