// ROUTE BASE: /api/mock
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { nanoid } from "nanoid";
import { Interview } from "../models/interview.models.js";
import { callLlama } from "../config/llama.js";
import mongoose from "mongoose";
export const startRoom = asyncHandler(async (req, res) => {
  const sessionId = nanoid(8);
  const {
    difficulty,
    topic,
    companyName,
    noOfProblems,
    experienceLevel,
    language,
  } = req.body;

  if (!difficulty || !noOfProblems || !experienceLevel)
    throw new ApiError(400, "All fields are not present");

  const prompt = `
You are a technical interviewer preparing a DSA mock interview session.

CANDIDATE PROFILE:
- Experience Level: ${experienceLevel}
- Target Company: ${companyName || "a top tech company"}
- Preferred Language: ${language}

SESSION CONFIGURATION:
- Number of Problems: ${noOfProblems}
- Target Difficulty: ${difficulty}
- Requested Topics: ${!topic || topic === "" ? "Any DSA topics" : topic}

Generate exactly ${noOfProblems} DSA problem(s) for this candidate.

Rules:
- Match difficulty to the target difficulty specified
- If topics are specified, pick problems from those topics only. If not, choose varied DSA topics appropriate for the difficulty
- Reference solution must be written in ${language}
- Problems must be distinct, do not repeat the same topic twice if noOfProblems > 1
- Match question depth and complexity to the candidate's experience level
- Examples must be clear with Input and Output clearly labeled
- Constraints must be specific with actual numeric bounds

You MUST respond with only a valid JSON object, no text outside it:
{
  "problems": [
    {
      "title": "<short problem title>",
      "statement": "<2-3 lines describing the problem clearly>",
      "examples": "<Example 1:\nInput: ...\nOutput: ...\n\nExample 2:\nInput: ...\nOutput: ...>",
      "constraints": "<1 <= n <= 10^5\n...each constraint on its own line>",
      "topic": ["<primary topic>", "<secondary topic if applicable>"],
      "difficulty": "<Easy | Medium | Hard>",
      "referenceSolution": "<complete working solution in ${language}>"
    }
  ]
}
`;

  const rawResponse = await callLlama(prompt);

  let parsed;
  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ApiError(
      500,
      "AI response could not be parsed. Please try again.",
    );
  }

  const createdSession = await Interview.create({
    sessionId,
    userId: req.user?._id,
    status: "active",
    language: language || "Java",
    company: companyName || null,
    targetDifficulty: difficulty,
    targetTopics: topic ? topic.split(",").map((t) => t.trim()) : [],
    totalProblems: noOfProblems,
    experienceLevel,
    problem: parsed.problems.map((p,index) => ({
      problemIdx: index, 
      question: JSON.stringify({
        title: p.title,
        statement: p.statement,
        examples: p.examples,
        constraints: p.constraints,
      }),
      topic: p.topic,
      difficulty: p.difficulty,
      referenceSolution: p.referenceSolution,
    })),
  });

  if (!createdSession)
    throw new ApiError(
      400,
      "Creation of the session failed. Please try again.",
    );

  return res
    .status(200)
    .json(new ApiResponse(200, "Session Created Successfully", createdSession));
});

// GET /:sessionId
export const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "Session Id cannot be extracted from the link");
  }
  const session = await Interview.findOne({ sessionId: sessionId });
  if (!session) {
    throw new ApiError(404, "Session with the requested Id cannot be found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Session fetched successfully", session));
});

// GET /all
// GET /all-sessions
export const getAllSessions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Unauthorized Request");
  }
  const allSessions = await Interview.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $sort: {
        createdAt: -1, // fixed: was `startedAt`, which doesn't exist
      },
    },
    {
      $project: {
        sessionId: 1,
        language: 1,
        status: 1,
        endedAt: 1,
        score: 1,
        createdAt: 1, // added: needed by the all-sessions list
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Sessions Fetched Successfully", allSessions));
});

// POST /:sessionId/hesitation
export const hesitation = asyncHandler(async (req, res) => {
  const { hesitations } = req.body;
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ApiError(
      400,
      "Session Id cannot be extracted from the parameter.",
    );
  }
  if (!Array.isArray(hesitations) || hesitations.length === 0) {
    throw new ApiError(400, "Hesitations must be a non-empty array.");
  }

  const newSession = await Interview.findOneAndUpdate(
    { sessionId },
    { $push: { hesitations: { $each: hesitations } } },
    { new: true },
  );

  if (!newSession) {
    throw new ApiError(
      404,
      "Session couldn't be found or hesitation addition failed",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Hesitations added successfully",
        newSession.hesitations,
      ),
    );
});

// GET /:sessionId/heatmap
export const heatMap = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "Session Id cannot be extracted");
  }
  const session = await Interview.findOne(
    { sessionId: sessionId },
    { hesitations: 1 },
  );
  if (!session) {
    throw new ApiError(404, "Session couldnt be found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Session heatmap fetched successfully",
        session.hesitations,
      ),
    );
});

// POST /:sessionId/snapshot
export const addSnapshot = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { sessionId } = req.params;
  if (!sessionId || !code) {
    throw new ApiError(400, "Either the sessionId or the code cannot be found");
  }

  // OPTIMIZED: Direct findOneAndUpdate
  const session = await Interview.findOneAndUpdate(
    { sessionId },
    { $push: { codeSnapShots: { code, timestamp: new Date() } } },
    { new: true },
  );

  if (!session) {
    throw new ApiError(404, "Session with the requested id cannot be found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Snapshot added successfully",
        session.codeSnapShots,
      ),
    );
});

// GET /:sessionId/snapshot
export const getSnapshot = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "SessionId cannot be found");
  }

  const session = await Interview.findOne(
    { sessionId: sessionId },
    { codeSnapShots: 1 },
  );
  if (!session) {
    throw new ApiError(404, "Session could not be found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Snapshots fetched successfully",
        session.codeSnapShots,
      ),
    );
});

// POST /:sessionId/message
// POST /:sessionId/message
export const addQuesandAns = asyncHandler(async (req, res) => {
  const { question, answer, duration, problemIdx } = req.body;
  const { sessionId } = req.params;

  if (!sessionId) throw new ApiError(400, "SessionId cannot be found");
  if (!question) throw new ApiError(400, "Question cannot be empty"); // answer can be ""
  if (problemIdx === undefined || problemIdx === null)
    throw new ApiError(400, "problemIdx is required");

  const updatePath = `problem.${problemIdx}.quesAndAns`;

  const session = await Interview.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        [updatePath]: {
          question,
          answer: answer || "", // store empty string, not null
          answerDuration: duration || 0,
          questionIdx: problemIdx,
          
        },
      },
    },
    { new: true },
  );

  if (!session) throw new ApiError(404, "Session could not be found");
  if (!session.problem[problemIdx])
    throw new ApiError(400, "Invalid problemIdx");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Question and answer added successfully",
        session.problem[problemIdx].quesAndAns,
      ),
    );
});

// PATCH /:sessionId/language
export const updateLanguage = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { language } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "SessionId cannot be found");
  }
  if (!language) {
    throw new ApiError(400, "Language could not be empty");
  }

  // OPTIMIZED: Direct findOneAndUpdate
  const session = await Interview.findOneAndUpdate(
    { sessionId },
    { $set: { language } },
    { new: true },
  );

  if (!session) {
    throw new ApiError(404, "Session could not be found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Language updated successfully", session.language),
    );
});

// PATCH /:sessionId/final-code
export const updateFinalCode = asyncHandler(async (req, res) => {
  const { finalCode, idx, duration } = req.body;
  const { sessionId } = req.params;

  if (!sessionId) throw new ApiError(400, "SessionId cannot be found");
  if (
    idx === undefined ||
    idx === null ||
    finalCode === undefined ||
    finalCode === null
  )
    throw new ApiError(400, "Index and final code are required");

  const updateFields = {
    [`problem.${idx}.finalCode`]: finalCode,
  };
  if (duration !== undefined) {
    updateFields[`problem.${idx}.duration`] = duration;
  }

  const session = await Interview.findOneAndUpdate(
    { sessionId },
    { $set: updateFields },
    { new: true },
  );

  if (!session) throw new ApiError(404, "Session could not be found");
  if (!session.problem[idx]) throw new ApiError(400, "Not a valid Index");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Final code saved successfully",
        session.problem[idx],
      ),
    );
});

// POST /:sessionId/end
export const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "SessionId cannot be found");
  }

  // OPTIMIZED: Direct findOneAndUpdate
  const session = await Interview.findOneAndUpdate(
    { sessionId },
    { $set: { status: "ended", endedAt: Date.now() } },
    { new: true },
  );

  if (!session) {
    throw new ApiError(404, "Session could not be found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Session details updated successfully", session),
    );
});

// POST /:sessionId/generate-report
export const generateReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) throw new ApiError(400, "SessionId cannot be found");

  const session = await Interview.findOne({ sessionId });
  if (!session) throw new ApiError(404, "Session could not be found");

  // if report already generated, return it directly — no AI call
  if (session.report) {
    const parsed = JSON.parse(session.report);
    return res
      .status(200)
      .json(new ApiResponse(200, "Report fetched successfully", parsed));
  }
  const allQuesAndAns = session.problem.flatMap((p, idx) =>
    (p.quesAndAns || []).map((qa) => ({
      problemIdx: idx,
      question: qa.question,
      answer: qa.answer,
      answerDuration: qa.answerDuration,
    })),
  );

  const prompt = `
    You are a senior technical recruiter evaluating a candidate for an Intern/SDE-1 role.

    Here is the problem the candidate was given:
    ${JSON.stringify(session.problem, null, 2)}

    Here are the AI-generated probing questions asked during the session and the candidate's answers:
    ${JSON.stringify(allQuesAndAns, null, 2)}

    Here are the hesitation events recorded during the session (longPause, deletion, idle — with line numbers and durations):
    ${JSON.stringify(session.hesitations, null, 2)}

    Based on all of this, generate a detailed performance report.

    You MUST respond with only a valid JSON object in this exact structure, no explanation outside the JSON:
    {
      "score": <number between 0 and 10>,
      "summary": "<2-3 sentence overall summary>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"],
      "hesitationAnalysis": "<paragraph analyzing where and why the candidate struggled based on hesitation data>",
      "communicationAnalysis": "<paragraph analyzing how well they explained their thought process in the Q&A>",
      "verdict": "<one of: Strong Hire, Hire, No Hire, Strong No Hire>",
      "feedback": "<detailed paragraph of constructive feedback for the candidate>"
    }`;

  const rawResponse = await callLlama(prompt);

  let parsed;
  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ApiError(
      500,
      "AI response could not be parsed. Please try again.",
    );
  }

  session.score = parsed.score;
  session.report = JSON.stringify(parsed);
  await session.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Report generated successfully", parsed));
});

// POST /:sessionId/code (or ai-question)
export const addQuestion = asyncHandler(async (req, res) => {
  const { sessionId } = req.params; // removed unused problemIdx

  if (!sessionId) {
    throw new ApiError(400, "SessionId cannot be found");
  }

  // fixed: project all three fields the prompt actually uses
  const session = await Interview.findOne(
    { sessionId },
    { codeSnapShots: 1, problem: 1, quesAndAns: 1 },
  );

  if (!session) {
    throw new ApiError(404, "Session could not be found");
  }

  const codeSnapshots =
    session.codeSnapShots.length > 4
      ? session.codeSnapShots.slice(session.codeSnapShots.length - 4)
      : session.codeSnapShots;

  const prompt = `
    You are a senior technical interviewer evaluating a candidate live.

    Here are the problems the candidate was given:
    ${JSON.stringify(session.problem, null, 2)}

    Here are the last few snapshots of their code:
    ${JSON.stringify(codeSnapshots, null, 2)}

    Here are the questions already asked and their answers (do not repeat these):
    ${JSON.stringify(session.quesAndAns, null, 2)}

    Based on the code snapshots, ask one focused probing question about a specific choice 
    the candidate made — a data structure, algorithm decision, edge case they may have missed, 
    or complexity tradeoff. Do not ask a question already covered above.

    You MUST respond with only a valid JSON object, no text outside it:
    {
      "question": "<specific probing question based on their actual code>"
    }
  `;

  const rawResponse = await callLlama(prompt);

  let parsed;
  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ApiError(
      500,
      "AI response could not be parsed. Please try again.",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Question generated successfully", parsed.question),
    );
});
