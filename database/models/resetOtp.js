import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class ResetOtp extends Model {
    static associate(models) {
      ResetOtp.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  ResetOtp.init(
    {
      user_id: {
        type: DataTypes.UUID,
      },
      otp: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ResetOtp",
      tableName: "reset-otps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return ResetOtp;
};
