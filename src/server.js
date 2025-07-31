import app from "./app.js";
import * as configs from "../config/index.js";

import { sequelize } from "../database/models/index.js";

// I will change it later
let server, mongooseConnection;

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

// need changes in tests also
export { server, mongooseConnection };
