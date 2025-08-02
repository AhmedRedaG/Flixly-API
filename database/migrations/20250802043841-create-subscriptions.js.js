export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      subscriber_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "subscriptions",
      ["subscriber_id", "channel_id"],
      {
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subscriptions");
  },
};
