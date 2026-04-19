const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
  title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
     description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    video: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contentType: {
      type: DataTypes.ENUM("RECIPE", "DISH"), //, "POST", "REEL"
      allowNull: false,
      defaultValue: "DISH",//POST
    },
    mediaType: {
      type: DataTypes.ENUM("IMAGE", "VIDEO", "NONE"),
      allowNull: false,
      defaultValue: "NONE",
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  }
);

module.exports = Post;