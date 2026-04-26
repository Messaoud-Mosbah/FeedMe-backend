const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
      const Product = require("./productModel");


const Comment = sequelize.define("Comment", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: "comments",
  hooks: {
    afterCreate: async (comment) => {
      await Product.increment('commentCount', { where: { id: comment.productId } });
    },
    afterDestroy: async (comment) => {
      await Product.decrement('commentCount', { where: { id: comment.productId } });
    }
  }
});

module.exports = Comment;