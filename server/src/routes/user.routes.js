import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenGeneration,
  updateAccountDetails,
  updateCurrentPassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyjwt, logoutUser);
userRouter.route("/refresh-token").post(refreshTokenGeneration);
userRouter.route("/me").get(verifyjwt,getCurrentUser);
userRouter.route("/update-password").patch(verifyjwt, updateCurrentPassword);
userRouter.route("/update-account").patch(verifyjwt, updateAccountDetails);

export default userRouter;
