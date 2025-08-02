import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      Playlist.belongsTo(models.Channel, {
        foreignKey: "channel_id",
        as: "channel",
      });

      // Playlist belongs to many videos through playlist_videos
      Playlist.belongsToMany(models.Video, {
        through: models.PlaylistVideo,
        foreignKey: "playlist_id",
        otherKey: "video_id",
        as: "videos",
      });
    }
  }

  Playlist.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
      },
      channel_id: {
        type: DataTypes.UUID,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Playlist",
      tableName: "playlists",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Playlist;
};
