import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import {
  startRoom,
  getAllSessions,
  getSession,
  hesitation,
  heatMap,
  addSnapshot,
  getSnapshot,
  addQuestion,
  addQuesandAns,
  updateLanguage,
  updateFinalCode,
  endSession,
  generateReport,
} from "../controllers/interview.controller.js";

const mockRouter = Router();

mockRouter.route("/start").post(verifyjwt, startRoom);
mockRouter.route("/all-sessions").get(verifyjwt, getAllSessions); 
mockRouter.route("/:sessionId").get(verifyjwt, getSession);
mockRouter
  .route("/:sessionId/snapshot")
  .post(verifyjwt, addSnapshot)
  .get(verifyjwt, getSnapshot);
mockRouter.route("/:sessionId/message").post(verifyjwt, addQuesandAns);
mockRouter.route("/:sessionId/hesitation").post(verifyjwt, hesitation);
mockRouter.route("/:sessionId/heatmap").get(verifyjwt, heatMap);
mockRouter.route("/:sessionId/language").patch(verifyjwt, updateLanguage);
mockRouter.route("/:sessionId/final-code").patch(verifyjwt, updateFinalCode);
mockRouter.route("/:sessionId/end").post(verifyjwt, endSession);
mockRouter.route("/:sessionId/generate-report").post(verifyjwt, generateReport);
mockRouter.route("/:sessionId/ai-question").post(verifyjwt, addQuestion);

export default mockRouter;
