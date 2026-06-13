import { Room } from "../models/room.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { callLlama } from "../config/llama.js";
import { nanoid } from "nanoid";

const getInterviewerId = (room) => room.interviewer?._id ?? room.interviewer;

// POST /create
export const createRoom = asyncHandler(async (req, res) => {
  const existingRoom = await Room.findOne({
    interviewer: req.user._id,
    status: { $in: ["waiting", "active"] },
  }).populate("interviewer", "username email");

  if (existingRoom) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Rejoined your existing room", existingRoom));
  }

  const roomId = nanoid(8);
  const room = await Room.create({ roomId, interviewer: req.user._id });
  const createdRoom = await Room.findById(room._id).populate(
    "interviewer",
    "username email",
  );
  if (!createdRoom) throw new ApiError(500, "Error while creating the room");
  return res
    .status(201)
    .json(new ApiResponse(201, "Room created successfully", createdRoom));
});

// GET /
export const getRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rooms = await Room.find({
    $or: [{ interviewer: userId }, { candidate: userId }],
  })
    .select("roomId status createdAt endedAt interviewer candidate problem")
    .populate("interviewer", "username email")
    .populate("candidate", "username email")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, "Rooms fetched successfully", rooms));
});

// GET /:roomId
export const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId })
    .populate("interviewer", "username email")
    .populate("candidate", "username email");

  if (!room) throw new ApiError(404, "Room not found");

  // Block ended rooms from direct URL access
  if (room.status === "ended") {
    throw new ApiError(403, "This room has already ended");
  }

  const userId = req.user._id.toString();
  const candidateId = room.candidate
    ? (room.candidate?._id ?? room.candidate).toString()
    : null;

  if (room.isCandidateBlocked && candidateId === userId) {
    throw new ApiError(403, "You have been removed from this room.");
  }

  return res.status(200).json(new ApiResponse(200, "Room fetched", room));
});

// POST /:roomId/join
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId });
  if (!room)
    throw new ApiError(404, "Room not found. Please check the room ID");

  if (room.status === "ended") {
    throw new ApiError(400, "This room has already ended");
  }

  const userId = req.user._id.toString();
  const interviewerId = getInterviewerId(room).toString();
  const candidateId = room.candidate
    ? (room.candidate?._id ?? room.candidate).toString()
    : null;

  if (interviewerId === userId) {
    const fullRoom = await Room.findOne({ roomId })
      .populate("interviewer", "username email")
      .populate("candidate", "username email");
    return res
      .status(200)
      .json(new ApiResponse(200, "Welcome back to your room", fullRoom));
  }

  if (room.isCandidateBlocked && candidateId === userId) {
    return res
      .status(403)
      .json({ message: "You have been removed from this room." });
  }

  if (candidateId && candidateId === userId) {
    const fullRoom = await Room.findOne({ roomId })
      .populate("interviewer", "username email")
      .populate("candidate", "username email");
    return res
      .status(200)
      .json(new ApiResponse(200, "Welcome back to the room", fullRoom));
  }

  if (candidateId && candidateId !== userId) {
    throw new ApiError(400, "A candidate has already joined this room");
  }

  const joinedRoom = await Room.findByIdAndUpdate(
    room._id,
    { $set: { candidate: req.user._id, status: "active" } },
    { new: true },
  )
    .populate("interviewer", "username email")
    .populate("candidate", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Joined room successfully", joinedRoom));
});

// PATCH /:roomId/end
export const endRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId });
  if (!room) throw new ApiError(404, "Room not found");
  if (room.status === "ended") throw new ApiError(400, "Room is already over");
  if (getInterviewerId(room).toString() !== req.user._id.toString())
    throw new ApiError(403, "Only the interviewer can end the room");

  const endedRoom = await Room.findByIdAndUpdate(
    room._id,
    { $set: { status: "ended", endedAt: new Date() } },
    { new: true },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Room ended successfully", endedRoom));
});

// POST /:roomId/snapshot
export const saveSnapshot = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { snapshots } = req.body;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!Array.isArray(snapshots))
    throw new ApiError(400, "snapshots must be an array");

  if (snapshots.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, "No snapshots to save", []));

  const room = await Room.findOneAndUpdate(
    { roomId },
    { $push: { codeSnapshots: { $each: snapshots } } },
    { new: true },
  );
  if (!room) throw new ApiError(404, "Room not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Snapshots saved successfully", room.codeSnapshots),
    );
});

// GET /:roomId/replay
export const replaySnap = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId }, { codeSnapshots: 1 });
  if (!room) throw new ApiError(404, "Room not found");

  const sortedSnapshots = room.codeSnapshots.sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Snapshots fetched successfully", sortedSnapshots),
    );
});

// POST /:roomId/hesitation
export const addHesitation = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { hesitations } = req.body;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!Array.isArray(hesitations))
    throw new ApiError(400, "hesitations array is required");

  if (hesitations.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, "No hesitations to save", []));

  const room = await Room.findOneAndUpdate(
    { roomId },
    { $push: { hesitations: { $each: hesitations } } },
    { new: true },
  );
  if (!room) throw new ApiError(404, "Room not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Hesitations saved successfully", room.hesitations),
    );
});

// POST /:roomId/summary  (was GET — mutates DB so must be POST)
export const roomSummary = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId }).populate("candidate", "username");
  if (!room) throw new ApiError(404, "Room not found");
  if (!room.problem || room.problem.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No problems to summarize", null));
  }

  const problemSummaries = room.problem.map((p, idx) => ({
    index: idx + 1,
    title: p.title,
    description: p.description,
    examples: p.examples || "None",
    constraints: p.constraints || "None",
    finalCode: p.finalCode || "No code submitted",
    duration: p.duration ? `${p.duration} seconds` : "Not recorded",
  }));

  const prompt = `
You are a senior software engineer reviewing a technical interview session for an Intern/SDE-1 position.

Interview details:
- Candidate: ${room.candidate?.username || "Unknown"}
- Total problems attempted: ${problemSummaries.length}
- Session duration: ${
    room.endedAt
      ? Math.round((new Date(room.endedAt) - new Date(room.createdAt)) / 60000)
      : "N/A"
  } minutes

Problems and submitted code:
${JSON.stringify(problemSummaries, null, 2)}

Generate a performance report as a valid JSON object only — no markdown, no explanation, no extra text outside the JSON:
{
  "score": <integer 0–10>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength>", "<strength>"],
  "weaknesses": ["<weakness>", "<weakness>"],
  "codeQualityAnalysis": "<paragraph>",
  "timeManagement": "<paragraph>",
  "feedback": "<actionable paragraph>"
}`;

  const rawResponse = await callLlama(prompt);
  let parsed;
  try {
    // fix: strip <think> blocks before parsing (matches generateReport)
    const withoutThink = rawResponse
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    const cleaned = withoutThink.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ApiError(
      500,
      "AI response could not be parsed. Please try again.",
    );
  }

  room.summary = JSON.stringify(parsed);
  await room.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Report generated successfully", room.summary));
});

// POST /:roomId/problem
export const addProblem = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { title, description, examples, constraints } = req.body;

  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!title || !description)
    throw new ApiError(400, "Title and description are required");

  const room = await Room.findOne({ roomId });
  if (!room) throw new ApiError(404, "Room not found");
  if (room.status === "ended")
    throw new ApiError(400, "Cannot add problem to an ended room");
  if (getInterviewerId(room).toString() !== req.user._id.toString())
    throw new ApiError(403, "Only the interviewer can add a problem");

  const updatedRoom = await Room.findByIdAndUpdate(
    room._id,
    {
      $push: {
        problem: {
          problemId: nanoid(8),
          title,
          description,
          examples: examples || "",
          constraints: constraints || "",
        },
      },
    },
    { new: true },
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Problem added successfully", updatedRoom.problem),
    );
});

// PATCH /:roomId/problem/:problemId
export const updateProblem = asyncHandler(async (req, res) => {
  const { roomId, problemId } = req.params;
  const { finalCode, duration } = req.body;

  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!problemId) throw new ApiError(400, "Problem ID extraction failed");

  const room = await Room.findOne({ roomId });
  if (!room) throw new ApiError(404, "Room not found");

  const updateFields = {};
  if (finalCode !== undefined) updateFields["problem.$.finalCode"] = finalCode;
  if (duration !== undefined) updateFields["problem.$.duration"] = duration;

  if (Object.keys(updateFields).length === 0)
    throw new ApiError(400, "No valid fields provided to update");

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: room._id, "problem.problemId": problemId },
    { $set: updateFields },
    { new: true },
  );
  if (!updatedRoom) throw new ApiError(404, "Problem not found in this room");

  const updatedProblem = updatedRoom.problem.find(
    (p) => p.problemId === problemId,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Problem updated successfully", updatedProblem));
});

// PATCH /:roomId/problem/:problemId/edit
export const editProblem = asyncHandler(async (req, res) => {
  const { roomId, problemId } = req.params;
  const { title, description, examples, constraints } = req.body;

  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!problemId) throw new ApiError(400, "Problem ID extraction failed");

  const updatedRoom = await Room.findOneAndUpdate(
    { roomId, "problem.problemId": problemId },
    {
      $set: {
        "problem.$[elem].title": title,
        "problem.$[elem].description": description,
        "problem.$[elem].examples": examples || "",
        "problem.$[elem].constraints": constraints || "",
      },
    },
    { arrayFilters: [{ "elem.problemId": problemId }], new: true },
  );

  if (!updatedRoom) throw new ApiError(404, "Room or problem not found");

  const updatedProblem = updatedRoom.problem.find(
    (p) => p.problemId === problemId,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Problem edited successfully", updatedProblem));
});

// PATCH /:roomId/notes
export const updateNotes = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { notes } = req.body;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId });
  if (!room) throw new ApiError(404, "Room not found");
  if (getInterviewerId(room).toString() !== req.user._id.toString())
    throw new ApiError(403, "Only the interviewer can update notes");

  // fix: notes can be empty string — interviewer may save with no notes
  const updatedRoom = await Room.findByIdAndUpdate(
    room._id,
    { $set: { notes: notes ?? "" } },
    { new: true },
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Notes updated successfully", updatedRoom.notes),
    );
});

// POST /:roomId/generate-report
export const generateReport = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId }).populate(
    "candidate",
    "username email",
  );
  if (!room) throw new ApiError(404, "Room not found");
  if (room.status !== "ended")
    throw new ApiError(400, "Room must be ended before generating report");
  if (getInterviewerId(room).toString() !== req.user._id.toString())
    throw new ApiError(403, "Only the interviewer can generate the report");

  const problemSummaries = room.problem.map((p, i) => ({
    index: i + 1,
    title: p.title,
    description: p.description,
    examples: p.examples || "None provided",
    constraints: p.constraints || "None provided",
    finalCode: p.finalCode?.trim() || "No code submitted",
    timeSpentSeconds: p.duration || 0,
  }));

  const hesitationSummary = {
    total: room.hesitations.length,
    longPauses: room.hesitations
      .filter((h) => h.kind === "longPause")
      .map((h) => ({
        durationSeconds: h.duration,
        lineNumber: h.lineNumber,
        timestamp: h.timestamp,
      })),
    massDeletions: room.hesitations
      .filter((h) => h.kind === "massDeletion")
      .map((h) => ({
        durationSeconds: h.duration,
        timestamp: h.timestamp,
      })),
    idles: room.hesitations.filter((h) => h.kind === "idle").length,
  };

  const snapshotSummary = room.codeSnapshots.map((s) => ({
    code: s.code,
    timestamp: s.timestamp,
  }));

  const prompt = `
You are a senior technical interviewer evaluating a candidate for an Intern/SDE-1 role.

Candidate: ${room.candidate?.username ?? "Unknown"}
Language used: ${room.language}
Total problems attempted: ${problemSummaries.length}

PROBLEMS ATTEMPTED:
${JSON.stringify(problemSummaries, null, 2)}

HESITATION ANALYSIS DATA:
${JSON.stringify(hesitationSummary, null, 2)}

CODE PROGRESSION SNAPSHOTS (ordered by time):
${JSON.stringify(snapshotSummary, null, 2)}

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "score": <number 0-10>,
  "summary": "<2-3 sentence overall performance summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "hesitationAnalysis": "<paragraph>",
  "codeProgressionAnalysis": "<paragraph>",
  "perProblemFeedback": [
    {
      "title": "<problem title>",
      "codeQuality": "<brief assessment>",
      "timeEfficiency": "<was time spent reasonable>"
    }
  ],
  "verdict": "<Strong Hire | Hire | No Hire | Strong No Hire>",
  "feedback": "<detailed paragraph for the interviewer>"
}`;

  const rawResponse = await callLlama(prompt);
  let parsed;
  try {
    // fix: strip <think> blocks — DeepSeek reasoning models emit these
    const withoutThink = rawResponse
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    const cleaned = withoutThink.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ApiError(
      500,
      "AI response could not be parsed. Please try again.",
    );
  }

  room.report = JSON.stringify(parsed);
  await room.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Report generated successfully", parsed));
});

// PATCH /:roomId/block-candidate
export const blockCandidate = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room id extraction failed");

  const room = await Room.findOneAndUpdate(
    { roomId },
    { $set: { isCandidateBlocked: true } },
    { new: true },
  );
  if (!room) throw new ApiError(404, "Room not found");
  return res
    .status(200)
    .json(new ApiResponse(200, "Candidate blocked successfully", room));
});

// POST /:roomId/problem/:problemId/testcases
export const saveTestCases = asyncHandler(async (req, res) => {
  const { roomId, problemId } = req.params;
  const { testCases } = req.body;

  if (!roomId) throw new ApiError(400, "Room ID extraction failed");
  if (!problemId) throw new ApiError(400, "Problem ID extraction failed");
  if (!Array.isArray(testCases))
    throw new ApiError(400, "testCases must be an array");

  const room = await Room.findOneAndUpdate(
    { roomId, "problem.problemId": problemId },
    { $set: { "problem.$[elem].testCases": testCases } },
    { arrayFilters: [{ "elem.problemId": problemId }], new: true },
  );

  if (!room) throw new ApiError(404, "Room or problem not found");

  const updatedProblem = room.problem.find((p) => p.problemId === problemId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Test cases saved", updatedProblem.testCases));
});
export const heatMap = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new ApiError(400, "Room ID extraction failed");

  const room = await Room.findOne({ roomId }, { hesitations: 1 });
  if (!room) throw new ApiError(404, "Room not found");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Heatmap data fetched successfully",
        room.hesitations,
      ),
    );
});
// GET /:roomId/summary-detail  ← for the room detail/summary page
export const getRoomDetail = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId })
    .populate("interviewer", "username email")
    .populate("candidate", "username email");

  if (!room) throw new ApiError(404, "Room not found");

  const userId = req.user._id.toString();
  const interviewerId = (room.interviewer?._id ?? room.interviewer).toString();
  const candidateId = room.candidate
    ? (room.candidate?._id ?? room.candidate).toString()
    : null;

  if (userId !== interviewerId && userId !== candidateId) {
    throw new ApiError(403, "You are not a participant of this room");
  }

  return res.status(200).json(new ApiResponse(200, "Room fetched", room));
});
