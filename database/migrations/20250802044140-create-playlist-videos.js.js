export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("playlist_videos", {
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "playlists",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "playlist_videos",
      ["playlist_id", "video_id"],
      {
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("playlist_videos");
  },
};
