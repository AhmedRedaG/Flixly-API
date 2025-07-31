import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class ResetToken extends Model {
    static associate(models) {
      ResetToken.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  ResetToken.init(
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ResetToken",
      tableName: "reset_tokens",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return ResetToken;
};
