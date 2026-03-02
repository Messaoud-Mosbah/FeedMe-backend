'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      profilePicture: {
        type: Sequelize.STRING(255),
        defaultValue: "default.png",
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20), 
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      usagePreferences: {
        type: Sequelize.JSON, 
        allowNull: true,
      },
      kitchenCategories: {
        type: Sequelize.JSON, 
        allowNull: true,
      },
      userId: {
        type: Sequelize.UUID, 
        unique: true, // علاقة One-to-One
        allowNull: false,
        references: {
          model: 'users', // اسم الجدول الأب
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users_profiles');
  }
};