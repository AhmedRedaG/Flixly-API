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
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
      },
      otp: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tries: {
        type: DataTypes.INTEGER,
      },
      created_at: DataTypes.DATE,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ResetOtp",
      tableName: "reset_otps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return ResetOtp;
};
