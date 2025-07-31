export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("refresh_tokens", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      created_at: Sequelize.DATE,
      expires_at: Sequelize.DATE,
    });

    await queryInterface.addIndex("refresh_tokens", ["user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("refresh_tokens");
  },
};
