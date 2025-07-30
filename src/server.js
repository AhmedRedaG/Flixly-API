import app from "./app.js";
import * as configs from "../config/index.js";

const PORT = configs.env.port[configs.env.nodeEnv];

let server, mongooseConnection;

await (async () => {
  try {
    mongooseConnection = await configs.connectDB();
    server = app.listen(PORT, () => {
      console.log(
        `${configs.env.nodeEnv}: MongoDB connected and Server running on http://localhost:${PORT}`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

export { server, mongooseConnection };
