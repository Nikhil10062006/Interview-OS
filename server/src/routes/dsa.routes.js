import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import {
  addDSAQuestion,
  getQuestions,
  getQues,
  updateFields,
  deleteQuestion,
  getsolHistory,
  toggleBookMark,
  resetSR,
  getStats,
  getDueQues,
  review,
  getSeededQuestions,
} from "../controllers/dsa.controller.js";

const dsaRouter = Router();

dsaRouter.route("/").get(verifyjwt, getQuestions);
dsaRouter.route("/add").post(verifyjwt, addDSAQuestion);
dsaRouter.route("/stats").get(verifyjwt, getStats);
dsaRouter.route("/due").get(verifyjwt, getDueQues);
dsaRouter.route("/seeded").get(verifyjwt, getSeededQuestions);

dsaRouter.route("/:problemId").get(verifyjwt, getQues);
dsaRouter.route("/:problemId").delete(verifyjwt, deleteQuestion);

dsaRouter.route("/:problemId/update").patch(verifyjwt, updateFields);
dsaRouter.route("/:problemId/bookmark").patch(verifyjwt, toggleBookMark);
dsaRouter.route("/:problemId/reset").post(verifyjwt, resetSR);

dsaRouter.route("/:problemId/history").get(verifyjwt, getsolHistory);
dsaRouter.route("/:id/review").post(verifyjwt, review); 

export default dsaRouter;