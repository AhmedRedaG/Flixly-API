import app from "./app.js";
import * as configs from "./config/index.js";

const PORT = configs.env.port;

(async () => {
  try {
    await configs.connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
