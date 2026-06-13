// ROUTE BASE: /api/dsa
import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dsa } from "../models/dsa.models.js";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

// POST /add
export const addDSAQuestion = asyncHandler(async (req, res) => {
  const { question, questionLink, topic, difficulty } = req.body;
  const problemId = nanoid(8);

  // BUG FIX: difiiculty typo corrected to difficulty
  if (
    [question, questionLink, difficulty].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All the fields are necessary to add the respective question",
    );
  }
  if (!topic || topic.length === 0) {
    throw new ApiError(
      400,
      "The topic fields are necessary to add the respective question",
    );
  }
  if (!req.user) {
    throw new ApiError(400, "Unauthenticated request");
  }
  const addedQues = await Dsa.create({
    question,
    questionLink,
    topic,
    difficulty,
    userId: req.user._id,
    problemId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Question added successfully", addedQues));
});

// GET /
export const getQuestions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Unauthorized Request");
  }

  const allQuestions = await Dsa.find({
    userId: req.user._id,
  }).select("question questionLink topic difficulty");

  const count = allQuestions.length;

  return res.status(200).json(
    new ApiResponse(200, "All questions fetched successfully", {
      count,
      questions: allQuestions,
    }),
  );
});

// GET /:problemId
export const getQues = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!problemId) {
    throw new ApiError(400, "Problem id extraction failed");
  }
  const problem = await Dsa.findOne({ problemId });
  if (!problem) {
    throw new ApiError(404, "Problem with this problem id cannot be found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Problem details fetched successfully", problem),
    );
});

// PATCH /:problemId/update
export const updateFields = asyncHandler(async (req, res) => {
  const { field, value } = req.body;
  const { problemId } = req.params;

  if (!problemId) {
    throw new ApiError(400, "Problem Id extraction failed");
  }
  if (!field || !value || field.trim() === "" || value.trim() === "") {
    throw new ApiError(400, "Some of the fields are missing");
  }

  // OPTIMIZED: Direct findOneAndUpdate instead of read then save
  const problem = await Dsa.findOneAndUpdate(
    { problemId },
    { $set: { [field]: value } },
    { new: true },
  );

  if (!problem) {
    throw new ApiError(404, "Problem with the problem Id not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Field updated successfully", problem[field]));
});

// DELETE /:problemId
export const deleteQuestion = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!problemId) {
    throw new ApiError(400, "Problem Id extraction failed");
  }
  const deletedprob = await Dsa.deleteOne({ problemId });

  if (!deletedprob) {
    throw new ApiError(400, "Deletion of the problem failed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Deletion of the document successful", deletedprob),
    );
});

// GET /:problemId/history
export const getsolHistory = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!problemId) {
    throw new ApiError(400, "Problem Id extraction failed");
  }

  const problem = await Dsa.findOne(
    { problemId: problemId },
    { solutionHistory: 1 },
  );
  if (!problem) {
    throw new ApiError(404, "Problem with the problem id cannot be found");
  }

  // BUG FIX: Must return the sort calculation correctly
  const sortedSolutions = problem.solutionHistory.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Solution history fetched successfully",
        sortedSolutions,
      ),
    );
});

// PATCH /:problemId/bookmark
export const toggleBookMark = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!problemId) {
    throw new ApiError(400, "Problem Id extraction failed");
  }

  // Kept findOne + save because you need to flip the existing boolean
  const problem = await Dsa.findOneAndUpdate(
    { problemId },
    [{ $set: { isBookMarked: { $not: "$isBookMarked" } } }],
    { new: true },
  );

  if (!problem) {
    throw new ApiError(404, "Problem with the problem id cannot be found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookmark toggled successfully", problem));
});

// POST /:problemId/reset
export const resetSR = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!problemId) {
    throw new ApiError(400, "Problem Id extraction failed");
  }

  // OPTIMIZED: Direct findOneAndUpdate since we are resetting to known defaults
  const problem = await Dsa.findOneAndUpdate(
    { problemId },
    {
      $set: {
        intervalForNext: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: null,
        lastReviewedAt: null,
        lastRemarks: "",
      },
    },
    { new: true },
  );

  if (!problem) {
    throw new ApiError(404, "Problem with the problem id not found", problem);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem SR reset successfull", problem));
});

// GET /stats
export const getStats = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Not allowed to do this action");
  }

  const userId = req.user._id;

  const noOfQuestions = await Dsa.countDocuments({ userId });

  const dueToday = await Dsa.countDocuments({
    userId,
    $or: [{ nextReviewAt: null }, { nextReviewAt: { $lte: new Date() } }],
  });

  const easySolved = await Dsa.countDocuments({ userId, difficulty: "Easy" });
  const mediumSolved = await Dsa.countDocuments({
    userId,
    difficulty: "Medium",
  });
  const hardSolved = await Dsa.countDocuments({ userId, difficulty: "Hard" });

  const allDocs = await Dsa.find({ userId }).select("repetitions easeFactor");

  const totalReviews = allDocs.reduce((sum, doc) => sum + doc.repetitions, 0);

  const avgEaseFactor =
    allDocs.length > 0
      ? (
          allDocs.reduce((sum, doc) => sum + doc.easeFactor, 0) / allDocs.length
        ).toFixed(2)
      : 0;

  const topicMap = {};
  const allTopicDocs = await Dsa.find({ userId }).select("topic");
  allTopicDocs.forEach((doc) => {
    doc.topic.forEach((t) => {
      topicMap[t] = (topicMap[t] || 0) + 1;
    });
  });

  return res.status(200).json(
    new ApiResponse(200, "Stats fetched successfully", {
      noOfQuestions,
      dueToday,
      difficultyBreakdown: {
        Easy: easySolved,
        Medium: mediumSolved,
        Hard: hardSolved,
      },
      totalReviews,
      avgEaseFactor,
      topicBreakdown: topicMap,
    }),
  );
});

// GET /due
export const getDueQues = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Not allowed to do this action");
  }

  const probDue = await Dsa.find({
    userId: req.user._id,
    $or: [{ nextReviewAt: null }, { nextReviewAt: { $lte: new Date() } }],
  });

  const sortedProb = probDue.sort((a, b) => {
    if (!a.nextReviewAt) return -1;
    if (!b.nextReviewAt) return 1;
    return a.nextReviewAt - b.nextReviewAt;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Due Questions", sortedProb));
});

// POST /:id/review
export const review = asyncHandler(async (req, res) => {
  const { quality, solution, remarks } = req.body;
  const { problemId } = req.params;

  if (quality === undefined || quality === null) {
    throw new ApiError(400, "Quality is required");
  }

  if (quality < 0 || quality > 5) {
    throw new ApiError(400, "Quality must be between 0 and 5");
  }

  // Kept findOne + save because SM-2 logic requires computing new values from existing ones
  const problem = await Dsa.findOne({ problemId });
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // SM-2 logic
  if (quality < 3) {
    problem.repetitions = 0;
    problem.intervalForNext = 1;
  } else {
    if (problem.repetitions === 0) problem.intervalForNext = 1;
    else if (problem.repetitions === 1) problem.intervalForNext = 6;
    else
      problem.intervalForNext = Math.round(
        problem.intervalForNext * problem.easeFactor,
      );

    problem.repetitions++;
    problem.easeFactor =
      problem.easeFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (problem.easeFactor < 1.3) problem.easeFactor = 1.3;
  }

  problem.lastReviewedAt = new Date();
  problem.nextReviewAt = new Date(
    Date.now() + problem.intervalForNext * 24 * 60 * 60 * 1000,
  );

  if (remarks) problem.lastRemarks = remarks;

  problem.solutionHistory.push({
    solution: solution || null,
    quality,
    timestamp: new Date(),
  });

  await problem.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Review updated successfully", problem));
});

// GET /seeded
export const getSeededQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, list, search } = req.query;

  const { seededQuestions } = await import("../data/seededQuestions.js");

  let result = [...seededQuestions];

  if (difficulty) {
    result = result.filter((q) => q.difficulty === difficulty);
  }

  if (topic) {
    result = result.filter((q) =>
      q.topics.map((t) => t.toLowerCase()).includes(topic.toLowerCase()),
    );
  }

  if (list) {
    result = result.filter((q) =>
      q.lists.map((l) => l.toLowerCase()).includes(list.toLowerCase()),
    );
  }

  if (search) {
    result = result.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase()),
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Seeded questions fetched", result));
});
