import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const mapLanguageToJDoodle = (lang) => {
  const normalizedLang = lang.toLowerCase();
  const languageMap = {
    python: { name: "python3", version: "3" },
    python3: { name: "python3", version: "3" },
    javascript: { name: "nodejs", version: "3" },
    js: { name: "nodejs", version: "3" },
    java: { name: "java", version: "3" },
    c: { name: "c", version: "4" },
    cpp: { name: "cpp", version: "4" },
    "c++": { name: "cpp", version: "4" },
  };
  return languageMap[normalizedLang] || { name: normalizedLang, version: "0" };
};

export const executeCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language || code.trim() === "" || language.trim() === "") {
    throw new ApiError(400, "Code and language fields are required");
  }

  const jdoodleConfig = mapLanguageToJDoodle(language);

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.EXECUTION_API_CLIENT_ID,
      clientSecret: process.env.EXECUTION_API_KEY,
      script: code,
      language: jdoodleConfig.name,
      versionIndex: jdoodleConfig.version,
      stdin: input || "",
    });

    const data = response.data;

    // JDoodle returns statusCode 200 even for syntax errors.
    // The reliable way to check for Syntax/Runtime errors is if 'memory' is null or 'error' is present.
    const isError = data.statusCode !== 200 || !!data.error || !data.memory;
    const finalOutput = data.error || data.output || "";

    const executionResult = {
      stdout: isError ? "" : finalOutput,
      stderr: isError ? finalOutput : "",
      hasError: isError, // <-- The frontend needs this to turn the panel red!
      success: !isError,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Code Executed Successfully via JDoodle",
          executionResult,
        ),
      );
  } catch (error) {
    console.error(
      "Execution API Error Details:",
      error.response?.data || error.message,
    );

    throw new ApiError(
      500,
      "Execution Engine Failed: " +
        (error.response?.data?.error || error.message),
    );
  }
});
