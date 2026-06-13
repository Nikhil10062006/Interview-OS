import mongoose from "mongoose";
const codeSnapShotsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const hesitationsSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ["longPause", "massDeletion", "idle"],
    default: "idle",
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 0,
  },
  lineNumber: {
    type: Number,
    required: true,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const quesAndAnsSchema = new mongoose.Schema({
  questionIdx: {
    type: Number,
    default: 0,
  },
  question: {
    type: String,
    default: null,
  },
  answer: {
    type: String,
    default: null,
  },
  answerDuration: {
    type: Number,
    default: 0,
  },
});

const problemSchema = new mongoose.Schema({
  problemIdx: {
    type: Number,
    default: 0,
  },
  question: {
    type: String,
    required: true,
  },
  topic: {
    type: [String],
    default: [],
  },
  duration: {
    type: Number,
    default: 0,
  },
  referenceSolution: {
    type: String,
    default: null,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  finalCode: {
    type: String,
    default: "",
  },

  quesAndAns: {
    type: [quesAndAnsSchema],
    default: [],
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    language: {
      type: String,
      default: "Java",
    },
    status: {
      type: String,
      enum: ["waiting", "active", "ended"],
      default: "waiting",
    },
    problem: {
      type: [problemSchema],
      default: [],
    },
    codeSnapShots: {
      type: [codeSnapShotsSchema],
      default: [],
    },
    hesitations: {
      type: [hesitationsSchema],
      default: [],
    },
    company: {
      type: String,
      default: null,
    },
    targetDifficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    targetTopics: {
      type: [String],
      default: [],
    },
    totalProblems: {
      type: Number,
      default: 1,
    },
    experienceLevel: {
      type: String,
      default: "Fresher",
    },
    score: {
      type: Number,
      default: 0,
    },
    report: {
      type: String,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Interview = mongoose.model("Interview", interviewSchema);
