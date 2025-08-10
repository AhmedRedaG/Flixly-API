export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reset-otps", {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      otp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tries: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("reset-otps", ["user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reset_tokens");
  },
};
