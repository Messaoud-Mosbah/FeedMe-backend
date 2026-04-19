const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const PostMedia = sequelize.define(
  "PostMedia",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false, // chemin de l'image ou vedio
    }, 
    type : {
      type: DataTypes.ENUM('IMAGE', 'VIDEO'),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
     
    },
  },
  {
    tableName: "posts_media",
    timestamps: true,
  }
);
 
module.exports = PostMedia;