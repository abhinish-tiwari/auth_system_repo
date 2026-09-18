import mongoose from "mongoose";
import { RefreshToken } from "../models/refresh-token.model";
import { generateAccessToken } from "../utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token";

const REFRESH_TOKEN_DAYS = 7;

export const createRefreshToken = async (userId: string) => {
  const token = generateRefreshToken();

  const tokenHash = hashRefreshToken(token);

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await RefreshToken.create({
    userId: new mongoose.Types.ObjectId(userId),
    tokenHash,
    expiresAt,
    revokedAt: null,
  });

  return {
    token,
    expiresAt,
  };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const tokenHash = hashRefreshToken(token);

  await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
  );
};

export const refreshAccessToken = async (refreshToken: string) => {
  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.expiresAt.getTime() < Date.now()) {
    throw new Error("Refresh token expired");
  }

  // Rotate refresh token
  storedToken.revokedAt = new Date();

  await storedToken.save();

  const newRefreshToken = await createRefreshToken(
    storedToken.userId.toString(),
  );

  const accessToken = generateAccessToken(storedToken.userId.toString());

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
  };
};
