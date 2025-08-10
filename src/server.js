import app from "./app.js";
import * as configs from "../config/index.js";

import { sequelize } from "../database/models/index.js";

const PORT = configs.env.port[configs.env.nodeEnv];

let server, sequelizeConnection;

await (async () => {
  try {
    sequelizeConnection = await sequelize.authenticate();
    server = app.listen(PORT, () => {
      console.log(
        `${configs.env.nodeEnv}: Database connected and Server running on http://localhost:${PORT}`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

export { server, sequelizeConnection };
