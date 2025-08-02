import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, {
        foreignKey: "subscriber_id",
        as: "subscriber",
      });

      Subscription.belongsTo(models.Channel, {
        foreignKey: "channel_id",
        as: "channel",
      });
    }
  }

  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      subscriber_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      channel_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      tableName: "subscriptions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          fields: ["subscriber_id", "channel_id"],
          unique: true,
        },
      ],
    }
  );

  return Subscription;
};
