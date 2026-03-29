'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts_media', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: false               // ← chemin de l'image dans le dossier uploads (ex: "uploads/1234.jpg")
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0                // ← ordre d'affichage des images dans le post (0, 1, 2...)
      },
      type : {
            type: Sequelize.ENUM('IMAGE', 'VIDEO'),
            allowNull: false,
          },
      postId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',              // ← FK dépend de posts
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'            // ← post supprimé → images supprimées
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
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('posts_media');
  }
};