import * as uploadServer from "../services/upload.js";

export const uploadVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const file = req.file;
  const data = await uploadServer.remoteUploadImageService(user, videoId, file);
  res.jsend.success(data);
};

export const uploadImage = async (req, res) => {
  const user = req.user;
  const { processId } = req.params;
  const file = req.file;
  const { type } = req.query;
  const data = await uploadServer.remoteUploadImageService(
    user,
    processId,
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
