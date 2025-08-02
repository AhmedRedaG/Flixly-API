export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("video_views", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      video_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      watch_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      watched_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("video_views", ["video_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("video_views");
  },
};
