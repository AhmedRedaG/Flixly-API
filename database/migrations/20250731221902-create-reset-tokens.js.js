export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reset_tokens', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: Sequelize.DATE,
      expires_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reset_tokens');
  },
};
