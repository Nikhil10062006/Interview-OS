import mongoose from "mongoose";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const codeSnapshotSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const hesitationSchema = new mongoose.Schema({
  kind: {
    type: String,
    required: true,
    enum: ["longPause", "massDeletion", "idle"],
    default: "idle",
  },
  lineNumber: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    default:0,
  },
});

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: "" },
  expectedOutput: { type: String, default: "" },
  label: { type: String, default: "" }, // e.g. "Example 1"
  addedBy: {
    type: String,
    enum: ["interviewer", "candidate"],
    default: "interviewer",
  },
});
const problemSchema = new mongoose.Schema({
  problemId: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  examples: { type: String, default: "" },
  constraints: { type: String, default: "" },
  finalCode: { type: String, default: "" },
  duration: { type: Number, default: 0 },

  testCases: {
    type: [testCaseSchema],
    default: [],
  },
});
const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: { type: String, default: "Java" },
    status: {
      type: String,
      enum: ["waiting", "active", "ended"],
      default: "waiting",
    },
    problem: {
      type: [problemSchema],
      default: [],
    },
    codeSnapshots: {
      type: [codeSnapshotSchema],
      default: [],
    },
    hesitations: {
      type: [hesitationSchema],
      default: [],
    },
    report: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    isCandidateBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roomSchema.plugin(mongoosePaginate);
export const Room = mongoose.model("Room", roomSchema);
