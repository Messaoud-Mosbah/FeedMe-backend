'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userName: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true 
      },
      slug: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
       isLoggedOut:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
          },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      passwordChangedAt: {
        type: Sequelize.DATE
      },
      role: {
        type: Sequelize.ENUM("USER", "RESTAURANT", "ADMIN"),
        defaultValue: "USER"
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "SUSPENDED"),
        defaultValue: "ACTIVE"
      },
      passwordResetTokenHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verificationTokenHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verificationTokenExpires:{
             type: Sequelize.DATE,
            allowNull: true,
          },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isOnboardingCompleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('users');
  }
};