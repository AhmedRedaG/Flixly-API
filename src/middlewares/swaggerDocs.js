import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const swaggerDocument = YAML.load(path.join(process.cwd(), "swagger.yaml"));

export const swaggerMiddlewares = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
];