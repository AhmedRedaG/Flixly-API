import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class VideoReaction extends Model {
    static associate(models) {
      VideoReaction.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      VideoReaction.belongsTo(models.Video, {
        foreignKey: "video_id",
        as: "video",
      });
    }
  }

  VideoReaction.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      video_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_like: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VideoReaction",
      tableName: "video_reactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["user_id", "video_id"],
          unique: true,
        },
      ],
    }
  );

  return VideoReaction;
};
