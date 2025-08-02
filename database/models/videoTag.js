import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class VideoTag extends Model {
    static associate(models) {
      // This is a junction table, associations are handled in Video and Tag models
    }
  }

  VideoTag.init(
    {
      video_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "VideoTag",
      tableName: "video_tags",
      timestamps: false,
      indexes: [
        {
          fields: ["video_id", "tag_id"],
          unique: true,
        },
      ],
    }
  );

  return VideoTag;
};
