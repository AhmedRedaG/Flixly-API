import * as uploadServer from "../services/upload.js";

export const uploadVideo = async (req, res) => {
  const { video, file } = req;
  const data = await uploadServer.remoteUploadVideoService(video, file);
  res.jsend.success(data);
};

export const uploadImage = async (req, res) => {
  const { user, channel, video, file } = req;
  const { type } = req.query;
  const data = await uploadServer.remoteUploadImageService(
    user,
    channel,
    video,
    file,
    type
  );
  res.jsend.success(data);
};

export const getUploadStatus = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await uploadServer.getUploadStatusService(user, videoId);
  res.jsend.success(data);
};
