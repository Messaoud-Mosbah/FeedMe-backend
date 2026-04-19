'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
       description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
     
      video: {
        type: Sequelize.STRING(255), 
        allowNull: true
      },
        contentType: {
        type: Sequelize.ENUM('RECIPE', 'DISH'),
        allowNull: false,
        defaultValue: 'DISH'
      },
      mediaType: {
        type: Sequelize.ENUM('IMAGE', 'VIDEO', 'NONE'),
        allowNull: false,
        defaultValue: 'NONE'
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
        likeCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      commentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      userId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      }
   
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('posts');
  }
};
