import { executeCode } from "../controllers/execution.controller.js";
import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const executionRouter = Router();
executionRouter.route("/execute").post(verifyjwt,executeCode);
export default executionRouter;
