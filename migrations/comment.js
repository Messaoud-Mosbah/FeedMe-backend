"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comments", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      text: { type: Sequelize.TEXT, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: "products", key: "id" }, onDelete: "CASCADE" },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => { await queryInterface.dropTable("comments"); }
};