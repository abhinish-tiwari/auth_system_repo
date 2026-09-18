import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import healthRoutes from "./routes/health.routes";

import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";

const app = express();

const clientUrl = env.clientUrl;

if (!clientUrl) {
  throw new Error("CLIENT_URL is not defined");
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(cookieParser());

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
