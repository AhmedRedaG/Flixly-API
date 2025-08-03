import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";

const {
  User,
  RefreshToken,
  ResetToken,
  Channel,
  Playlist,
  Video,
  Subscription,
  VideoReaction,
  VideoView,
  VideoComment,
  Report,
} = db;

const publicVideoFields = [
  "id",
  "title",
  "description",
  "url",
  "thumbnail",
  "views_count",
  "likes_count",
  "dislikes_count",
  "comments_count",
  "duration",
  "publish_at",
];

/**
 * VIDEO CRUD
 */
// POST /api/videos
// Headers: Authorization
// Body: { title, description?, tags[] }
// Response: { video, upload_url? }
export const createVideoService = async (user, title, description, tags) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const video = await channel.createVideo({
    title,
    description,
    url: "https://www.youtube.com", // temporary url
  });

  // await video.createTags(tags); // need to implement

  const videoUploadUrl = `https://localhost:3000/upload/video/${video.id}`;
  const thumbnailUploadUrl = `https://localhost:3000/upload/image/${video.id}?type=thumbnail`;

  return {
    video,
    videoUploadUrl,
    thumbnailUploadUrl,
  };
};

// GET /api/videos/:videoId
// Response: { video with channel, tags, comments?, view_count }
export const getPublicVideoService = async (videoId) => {
  const video = await Video.findOne({
    where: { id: videoId, is_published: true, is_private: false },
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["username", "name", "avatar"],
      },
      // {
      //   model: Tag,
      //   as: "tags",
      //   attributes: ["name"],
      // },
      {
        model: VideoComment,
        as: "comments",
        include: {
          model: User,
          as: "user",
          attributes: ["username", "firstName", "lastName", "avatar"],
        },
        attributes: ["id", "content", "created_at"],
        limit: 10,
        raw: true,
      },
    ],
    attributes: publicVideoFields,
  });
  if (!video) throw new AppError("Video not found", 404);

  return video;
};

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|&parent_id=?
// Response: { comment }
export const getPublicVideoCommentsService = async (
  videoId,
  inPage,
  inLimit,
  sort,
  parent_id
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const comments = await VideoComment.findAll({
    where: { video_id: videoId, parent_comment_id: parent_id || null },
    include: {
      model: User,
      as: "user",
      attributes: ["username", "firstName", "lastName", "avatar"],
    },
    order,
    limit,
    offset,
    raw: true,
  });
  const total = comments?.length || 0;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    comments,
    pagination,
  };
};

// GET /api/videos/:videoId
// Authorization: Bearer token
// Response: { video with channel, tags, comments?, view_count }
export const getVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const video = await channel.getVideos({
    where: { id: videoId },
    // include: [
    //   {
    //     model: Tag,
    //     as: "tags",
    //     attributes: ["name"],
    //   },
    // ],
  });
  if (!video) throw new AppError("Video not found", 404);

  return video;
};

// PUT /api/videos/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, is_private?, tags[] }
// Response: { video }
export const updateVideoService = async (
  user,
  videoId,
  title,
  description,
  is_private,
  tags
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  if (title) video.title = title;
  if (description) video.description = description;
  if (is_private !== undefined) video.is_private = is_private;
  // if (tags) await video.setTags(tags); // need to implement

  await video.save();

  return video;
};

// DELETE /api/videos/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted" }
export const deleteVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  await video.destroy();

  return {
    message: "Video deleted successfully",
  };
};

// PATCH /api/videos/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET /api/videos
// Query: ?page=1&limit=20&sort=newest|trending|popular&category=?&search=?
// Response: { videos[], pagination, filters }

// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }

// GET /api/videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|date|views
// Response: { videos[], pagination, suggestions[] }

// GET /api/videos/recommended
// Headers: Authorization (optional)
// Query: ?page=1&limit=20
// Response: { videos[], pagination }

/**
 * VIDEO INTERACTIONS
 */
// POST /api/videos/:videoId/view
// Headers: Authorization (optional)
// Body: { watch_time } // seconds watched
// Response: { message: "View recorded" }

// POST /api/videos/:videoId/like
// Headers: Authorization
// Response: { is_liked: true, likes_count, dislikes_count }

// POST /api/videos/:videoId/dislike
// Headers: Authorization
// Response: { is_liked: false, likes_count, dislikes_count }

// DELETE /api/videos/:videoId/reaction
// Headers: Authorization
// Response: { likes_count, dislikes_count }

// GET /api/videos/:videoId/reactions
// Headers: Authorization (video owner only)
// Query: ?page=1&limit=20&type=like|dislike
// Response: { reactions[], pagination }

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|popular&parent_id=?
// Response: { comments[], pagination }

// POST /api/videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }
