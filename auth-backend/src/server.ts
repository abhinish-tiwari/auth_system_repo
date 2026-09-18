import mongoose from "mongoose";
import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Gracefully shutting down...`);

      server.close(async () => {
        console.log("HTTP server closed");

        try {
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed");
          process.exit(0);
        } catch (dbError) {
          console.error("Error closing MongoDB connection:", dbError);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

void startServer();
