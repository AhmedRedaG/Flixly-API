import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class VideoComment extends Model {
    static associate(models) {
      VideoComment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      VideoComment.belongsTo(models.Video, {
        foreignKey: "video_id",
        as: "video",
      });

      // Self-referencing association for nested comments
      VideoComment.belongsTo(models.VideoComment, {
        foreignKey: "parent_comment_id",
        as: "parentComment",
      });

      VideoComment.hasMany(models.VideoComment, {
        foreignKey: "parent_comment_id",
        as: "replies",
      });
    }
  }

  VideoComment.init(
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
      parent_comment_id: {
        type: DataTypes.UUID,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VideoComment",
      tableName: "video_comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["video_id"] }],
    }
  );

  return VideoComment;
};
