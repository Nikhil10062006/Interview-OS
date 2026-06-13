import { Router } from "express";
import {
  generateReport,
  updateNotes,
  updateProblem,
  addProblem,
  roomSummary,
  heatMap,
  addHesitation,
  replaySnap,
  saveSnapshot,
  endRoom,
  joinRoom,
  getRoom,
  getRoomDetail, // ADD
  getRooms,
  createRoom,
  editProblem,
  blockCandidate,
  saveTestCases,
} from "../controllers/room.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const roomRouter = Router();

roomRouter.route("/create").post(verifyjwt, createRoom);
roomRouter.route("/all-rooms").get(verifyjwt, getRooms);
roomRouter.route("/:roomId").get(verifyjwt, getRoom);
roomRouter.route("/:roomId/detail").get(verifyjwt, getRoomDetail); // ADD
roomRouter.route("/:roomId/join").post(verifyjwt, joinRoom);
roomRouter.route("/:roomId/end").patch(verifyjwt, endRoom);
roomRouter.route("/:roomId/block-candidate").patch(verifyjwt, blockCandidate);
roomRouter.route("/:roomId/snapshot").post(verifyjwt, saveSnapshot);
roomRouter.route("/:roomId/replay").get(verifyjwt, replaySnap);
roomRouter.route("/:roomId/hesitation").post(verifyjwt, addHesitation);
roomRouter.route("/:roomId/heatmap").get(verifyjwt, heatMap);
roomRouter.route("/:roomId/summary").post(verifyjwt, roomSummary);
roomRouter.route("/:roomId/problem").post(verifyjwt, addProblem);
roomRouter.route("/:roomId/problem/:problemId").patch(verifyjwt, updateProblem);
roomRouter
  .route("/:roomId/problem/:problemId/edit")
  .patch(verifyjwt, editProblem);
roomRouter.route("/:roomId/notes").patch(verifyjwt, updateNotes);
roomRouter.route("/:roomId/generate-report").post(verifyjwt, generateReport);
roomRouter
  .route("/:roomId/problem/:problemId/testcases")
  .post(verifyjwt, saveTestCases);

export default roomRouter;
