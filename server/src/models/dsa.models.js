import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
  solution: {
    type: String,
    default: null,
  },
  language: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    min: 0,
    max: 5,
  },
});

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
});

const dsaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {
    type: String,
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  questionLink: {
    type: String,
    required: true,
  },
  isBookMarked: {
    type: Boolean,
    default: false,
  },
  topic: {
    type: [String],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  intervalForNext: {
    type: Number,
    default: 0,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  nextReviewAt: {
    type: Date,
    default: null,
  },
  lastReviewedAt: {
    type: Date,
    default: null,
  },
  lastRemarks: {
    type: String,
    default: null,
  },
  hints: {
    type: [String],
    default: [],
  },
  testCases: {
    type: [testCaseSchema],
    default: [],
  },
  solutionHistory: {
    type: [solutionSchema],
    default: [],
  },
});

dsaSchema.index({ userId: 1, problemId: 1 }, { unique: true });
export const Dsa = mongoose.model("Dsa", dsaSchema);
