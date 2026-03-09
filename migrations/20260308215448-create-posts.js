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
      caption: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
     
      video: {
        type: Sequelize.STRING(255), //path of video
        allowNull: true
      },
        contentType: {
        type: Sequelize.ENUM('RECIPE', 'DISH','POST', 'REEL'),
        allowNull: false,
        defaultValue: 'POST'
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
        type: Sequelize.DATE, //pour trier les posts selon la date de creation
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      userId: { //Foreign Key/ ce tableau depend de user table 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',//change user id -> change this FK also in table posts
        onDelete: 'CASCADE' //delete user -> delete all posts of this user
      }
   
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('posts');
  }
};
