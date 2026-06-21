import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
export const generateAccessAndRefresh = async function (user) {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      400,
      err.message || "Error while creating access and refresh tokens",
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;
  if (
    [username, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, `Some field is empty.Please fill it.`);
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User already exists with that username or email");
  }
  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(400, "Failed to create the new User");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User Registered Succeessfully", createdUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, `Some of the fields is/are empty.Please fill it.`);
  }
  const registeredUser = await User.findOne({ email: email });
  if (!registeredUser) {
    throw new ApiError(400, "User Not found with this email");
  }
  console.log(registeredUser);
  const isPassCorrect = await registeredUser.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Wrong Password . Please try again");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRefresh(registeredUser);
  const loggedInUser = await User.findById(registeredUser._id).select(
    "-password -refreshToken",
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User Logged in Successfully", {
        loggedInUser,
        accessToken,
        refreshToken,
      }),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged out SuccessFully", null));
});

export const refreshTokenGeneration = asyncHandler(async (req, res) => {
  const incomingRefreshTokens =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshTokens) {
    throw new ApiError(400, "Refresh Tokens not found");
  }

  const decodedToken = await jwt.verify(
    incomingRefreshTokens,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(
      400,
      "User Could not be found with the decoded refresh tokens",
    );
  }
  if (incomingRefreshTokens !== user?.refreshToken) {
    throw new ApiError(400, "Not correct refresh Token");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const { accessToken, refreshToken } = await generateAccessAndRefresh(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Access Token Refreshed", {
        accessToken,
      }),
    );
});

export const updateCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword === "" || newPassword === "") {
    throw new ApiError(400, "Password is empty");
  }
  const user = await User.findById(req.user?._id);
  const isCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isCorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Modified Successfully", req.user));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User returned successfully", req.user));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  if (username === "" && email === "") {
    throw new ApiError(400, "Cannot update the details with empty parameters");
  }
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken",
  );
  if (username !== "") {
    user.username = username;
  }
  if (email !== "") {
    user.email = email;
  }
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Updated successfully", user));
});
