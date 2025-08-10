import AppError from "../utilities/appError.js";

export const isUserUploadVideoAllowed = async (req, res, next) => {
  const { user } = req;
  const { videoId } = req.params;

  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  if (video.processing_status === "completed")
    throw new AppError("Video already uploaded", 409);
  if (
    video.processing_status === "processing" &&
    video.processing_message.startsWith("video uploaded")
  )
    throw new AppError("Video already uploaded", 409);

  req.video = video;

  next();
};

export const isUserUploadImageAllowed = async (req, res, next) => {
  const { user } = req;
  const { processId } = req.params;
  const { type } = req.query;

  if (type === "userAvatar") {
    if (user.id !== processId) throw new AppError("User not found", 404);
  }

  const channel = await user.getChannel();
  req.channel = channel;

  if (type === "channelAvatar" || type === "channelBanner") {
    if (!channel || channel.id !== processId)
      throw new AppError("Channel not found", 404);
  }

  if (type === "thumbnail") {
    if (!channel) throw new AppError("Channel not found", 404);

    const [video] = channel.getVideos({ where: processId, limit: 1 });
    if (!video) throw new AppError("Video not found");

    req.video = video;
  }

  next();
};
