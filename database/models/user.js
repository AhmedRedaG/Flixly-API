import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // User has one channel
      User.hasOne(models.Channel, {
        foreignKey: "user_id",
        as: "channel",
      });

      // User has many refresh tokens
      User.hasMany(models.RefreshToken, {
        foreignKey: "user_id",
        as: "refreshTokens",
      });

      // User has one reset token
      User.hasOne(models.ResetToken, {
        foreignKey: "user_id",
        as: "resetToken",
      });

      // User has many video reactions
      User.hasMany(models.VideoReaction, {
        foreignKey: "user_id",
        as: "videoReactions",
      });

      // User has many video views
      User.hasMany(models.VideoView, {
        foreignKey: "user_id",
        as: "videoViews",
      });

      // User has many comments
      User.hasMany(models.VideoComment, {
        foreignKey: "user_id",
        as: "videoComments",
      });

      // User has many subscriptions (as subscriber)
      User.hasMany(models.Subscription, {
        foreignKey: "subscriber_id",
        as: "subscriptions",
      });

      // User has many playlists
      User.hasMany(models.Playlist, {
        foreignKey: "user_id",
        as: "playlists",
      });

      // User has many reports (as reporter)
      User.hasMany(models.Report, {
        foreignKey: "reporter_id",
        as: "reports",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "last_name",
      },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      googleId: { type: DataTypes.STRING, unique: true, field: "google_id" },
      password: DataTypes.STRING,
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      avatar: DataTypes.STRING,
      bio: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return User;
};
