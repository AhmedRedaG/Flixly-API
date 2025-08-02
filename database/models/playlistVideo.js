import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class PlaylistVideo extends Model {
    static associate(models) {
      // This is a junction table, associations are handled in Playlist and Video models
    }
  }

  PlaylistVideo.init(
    {
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      video_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "PlaylistVideo",
      tableName: "playlist_videos",
      timestamps: false,
      indexes: [
        {
          fields: ["playlist_id", "video_id"],
          unique: true,
        },
      ],
    }
  );

  return PlaylistVideo;
};
