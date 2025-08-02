import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, {
        foreignKey: "reporter_id",
        as: "reporter",
      });
    }
  }

  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      reporter_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      target_type: {
        type: DataTypes.ENUM("video", "comment"),
        allowNull: false,
      },
      target_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "reviewed", "dismissed"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "reports",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["target_id"] }],
    }
  );

  return Report;
};
