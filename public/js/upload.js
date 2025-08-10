const imageForm = document.getElementById("imageForm");
const videoForm = document.getElementById("videoForm");

imageForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = document.getElementById("imageType").value;
  const processId = document.getElementById("imageProcessId").value.trim();
  const token = document.getElementById("accessTokenImg").value.trim();
  const fileInput = document.getElementById("imageFile");
  const result = document.getElementById("imageResult");

  if (type === "thumbnail" && !processId) {
    result.textContent =
      "processId (videoId) is required for thumbnail uploads.";
    return;
  }

  const formData = new FormData();
  formData.append("image_file", fileInput.files[0]);

  const url = `/api/v1/upload/image/${encodeURIComponent(
    processId || "none"
  )}?type=${encodeURIComponent(type)}`;
  result.textContent = "Uploading image...";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: token } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success")
      throw new Error(data?.data?.message || data?.message || "Upload failed");
    const urlOut = data.data.imageUrl || data.data.uploadUrl;
    result.innerHTML = `✅ Uploaded`;
  } catch (err) {
    result.textContent = `❌ ${err.message}`;
  }
});

videoForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const videoId = document.getElementById("videoId").value.trim();
  const token = document.getElementById("accessTokenVid").value.trim();
  const fileInput = document.getElementById("videoFile");
  const result = document.getElementById("videoResult");

  if (!videoId) {
    result.textContent = "videoId is required.";
    return;
  }

  const formData = new FormData();
  formData.append("video_file", fileInput.files[0]);

  const url = `/api/v1/upload/video/${encodeURIComponent(videoId)}`;
  result.textContent = "Uploading video... (this may take a while)";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: token } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success")
      throw new Error(data?.data?.message || data?.message || "Upload failed");
    const urlOut = data.data.uploadUrl;
    result.innerHTML = `✅ Uploaded`;
  } catch (err) {
    result.textContent = `❌ ${err.message}`;
  }
});
