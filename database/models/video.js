import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      // Video belongs to channel
      Video.belongsTo(models.Channel, {
        foreignKey: "channel_id",
        as: "channel",
      });

      // Video has many reactions
      Video.hasMany(models.VideoReaction, {
        foreignKey: "video_id",
        as: "reactions",
      });

      // Video has many views
      Video.hasMany(models.VideoView, {
        foreignKey: "video_id",
        as: "views",
      });

      // Video has many comments
      Video.hasMany(models.VideoComment, {
        foreignKey: "video_id",
        as: "comments",
      });

      // Video belongs to many tags through video_tags
      Video.belongsToMany(models.Tag, {
        through: models.VideoTag,
        foreignKey: "video_id",
        otherKey: "tag_id",
        as: "tags",
      });

      // Video belongs to many playlists through playlist_videos
      Video.belongsToMany(models.Playlist, {
        through: models.PlaylistVideo,
        foreignKey: "video_id",
        otherKey: "playlist_id",
        as: "playlists",
      });
    }
  }

  Video.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      channel_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      dislikes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      trending_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      processing_status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
      processing_error: {
        type: DataTypes.TEXT,
      },
      duration: {
        type: DataTypes.INTEGER,
      },
      publish_at: {
        type: DataTypes.DATE,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Video",
      tableName: "videos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["channel_id"] }],
    }
  );

  return Video;
};
