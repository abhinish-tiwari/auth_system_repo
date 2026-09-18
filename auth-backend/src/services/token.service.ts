import mongoose from "mongoose";
import { RefreshToken } from "../models/refresh-token.model";
import { User } from "../models/user.model";
import { generateAccessToken } from "../utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token";
import { AppError } from "../utils/app-error";

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

  // 1. Look for the token regardless of revocation status to detect token reuse
  const existingToken = await RefreshToken.findOne({ tokenHash });

  if (!existingToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  // 2. Token reuse / theft detection: If token was already revoked, revoke all tokens for this user!
  if (existingToken.revokedAt !== null) {
    await RefreshToken.updateMany(
      { userId: existingToken.userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    throw new AppError(
      "Compromised session detected. All sessions invalidated, please log in again.",
      401
    );
  }

  // 3. Expiration check
  if (existingToken.expiresAt.getTime() < Date.now()) {
    throw new AppError("Refresh token expired", 401);
  }

  // 4. Atomic rotation to avoid race condition with concurrent requests
  const rotatedToken = await RefreshToken.findOneAndUpdate(
    {
      _id: existingToken._id,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
    {
      new: true,
    }
  );

  if (!rotatedToken) {
    throw new AppError("Refresh token already used", 401);
  }

  // 5. Verify user still exists in system
  const user = await User.findById(existingToken.userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  // 6. Issue new refresh token & access token
  const newRefreshToken = await createRefreshToken(
    existingToken.userId.toString()
  );

  const accessToken = generateAccessToken(existingToken.userId.toString());

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
  };
};
