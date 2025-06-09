import dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI)
  .then(() => app.listen(PORT))
  .then(() => console.log(`server is running on port ${PORT}`))
  .catch((err) => console.error(err));
