import { User } from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

import { LoginInput, RegisterInput } from "../validators/auth.validator";

import { createRefreshToken, revokeRefreshToken } from "./token.service";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({
    email: input.email,
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({
    email: input.email,
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await comparePassword(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user._id.toString());

  const refreshToken = await createRefreshToken(user._id.toString());

  return {
    accessToken,

    refreshToken: refreshToken.token,

    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};
