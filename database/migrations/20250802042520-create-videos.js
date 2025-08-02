export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("videos", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      channel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "channels",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      dislikes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      trending_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      processing_status: {
        type: Sequelize.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
      processing_error: {
        type: Sequelize.TEXT,
      },
      duration: {
        type: Sequelize.INTEGER,
      },
      publish_at: {
        type: Sequelize.DATE,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("videos", ["channel_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("videos");
  },
};
