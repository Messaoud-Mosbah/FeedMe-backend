const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
      const Product = require("./productModel");

const Like = sequelize.define("Like", {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  productId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
}, {
  tableName: "likes",
  indexes: [
    {
      unique: true,
      fields: ['userId', 'productId']
    }
  ],
  hooks: {
    afterCreate: async (like, options) => {
      await Product.increment('likeCount', { 
        where: { id: like.productId },
        transaction: options.transaction 
      });
    },
    afterDestroy: async (like, options) => {
      await Product.decrement('likeCount', { 
        where: { id: like.productId },
        transaction: options.transaction
      });
    }
  }
});

module.exports = Like;