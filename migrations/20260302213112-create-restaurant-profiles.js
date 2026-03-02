'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurant_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      restaurantName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      businessEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(20), 
        allowNull: false,
      },
      profilePicture: {
        type: Sequelize.STRING,
        defaultValue: "restaurant-default.png",
      },
      city: { type: Sequelize.STRING(50) },
      wilaya: { type: Sequelize.STRING(50) },
      street: { type: Sequelize.STRING(50), allowNull: true },
      postalCode: {
        type: Sequelize.STRING(10), 
        allowNull: true,
      },
      googleMapsLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kitchenCategories: {
        type: Sequelize.JSON, // ملاحظة: الـ Validation يتم في الموديل وليس هنا
      },
      openingHoursFrom: { type: Sequelize.TIME },
      openingHoursTo: { type: Sequelize.TIME },
      daysOpen: {
        type: Sequelize.JSON,
      },
      services: {
        type: Sequelize.JSON,
        defaultValue: { dineIn: false, takeaway: false, delivery: false, reservation: false },
      },
      userId: {
        type: Sequelize.UUID,
        unique: true, // علاقة One-to-One مع المستخدم
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
    await queryInterface.dropTable('restaurant_profiles');
  }
};