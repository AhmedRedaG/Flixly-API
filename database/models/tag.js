import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      // Tag belongs to many videos through video_tags
      Tag.belongsToMany(models.Video, {
        through: models.VideoTag,
        foreignKey: "tag_id",
        otherKey: "video_id",
        as: "videos",
      });
    }
  }

  Tag.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      use_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Tag",
      tableName: "tags",
      timestamps: false,
    }
  );

  return Tag;
};
