import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class VideoView extends Model {
    static associate(models) {
      VideoView.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      VideoView.belongsTo(models.Video, {
        foreignKey: "video_id",
        as: "video",
      });
    }
  }

  VideoView.init(
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
      watch_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      watched_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "VideoView",
      tableName: "video_views",
      timestamps: false,
      indexes: [{ fields: ["video_id"] }],
    }
  );

  return VideoView;
};
