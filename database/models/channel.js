import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Channel extends Model {
    static associate(models) {
      // Channel belongs to user
      Channel.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // Channel has many videos
      Channel.hasMany(models.Video, {
        foreignKey: "channel_id",
        as: "videos",
      });

      // Channel has many subscriptions
      Channel.hasMany(models.Subscription, {
        foreignKey: "channel_id",
        as: "subscriptions",
      });

      // Channel has many playlists
      Channel.hasMany(models.Playlist, {
        foreignKey: "channel_id",
        as: "playlists",
      });
    }
  }

  Channel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      banner: {
        type: DataTypes.STRING,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      subscribers: {
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
    },
    {
      sequelize,
      modelName: "Channel",
      tableName: "channels",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return Channel;
};
