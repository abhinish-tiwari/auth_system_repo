import "dotenv/config";

const requiredEnvVariables = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is not defined in environment variables`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI!,

  jwtSecret: process.env.JWT_SECRET!,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",

  clientUrl: process.env.CLIENT_URL!,

  nodeEnv: process.env.NODE_ENV || "development",
};
