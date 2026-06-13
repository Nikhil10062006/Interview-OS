import axiosInstance from "./axiosInstance.jsx";

export const startSession = (formFields) => {
  return axiosInstance.post("/phantom/start", formFields);
  // formFields: { difficulty, topic, companyName, noOfProblems, experienceLevel, language }
};

export const getSession = (sessionId) => {
  return axiosInstance.get(`/phantom/${sessionId}`);
};

export const getAllSessions = () => {
  return axiosInstance.get(`/phantom/all-sessions`);
};

// sends one hesitation record at a time — context loops over array
export const hesitation = (sessionId, hesitations) => {
  return axiosInstance.post(`/phantom/${sessionId}/hesitation`, {
    hesitations,
  });
};

export const mockHeatMap = (sessionId) => {
  return axiosInstance.get(`/phantom/${sessionId}/heatmap`);
};

export const addSnapshot = (sessionId, code) => {
  return axiosInstance.post(`/phantom/${sessionId}/snapshot`, { code });
};

export const getSnapshots = (sessionId) => {
  return axiosInstance.get(`/phantom/${sessionId}/snapshot`);
};

// fixed: added problemIdx param, fixed URL, added question param
export const addQuesAndAns = (
  sessionId,
  problemIdx,
  question,
  answer,
  duration,
) => {
  return axiosInstance.post(`/phantom/${sessionId}/message`, {
    question,
    answer,
    duration,
    problemIdx,
  });
};

export const updateLanguage = (sessionId, language) => {
  return axiosInstance.patch(`/phantom/${sessionId}/language`, { language });
};

export const updateFinalCode = (sessionId, finalCode, idx, duration) =>
  axiosInstance.patch(`/phantom/${sessionId}/final-code`, {
    finalCode,
    idx,
    duration,
  });

export const endSession = (sessionId) => {
  return axiosInstance.post(`/phantom/${sessionId}/end`);
};

export const generateReport = (sessionId) => {
  return axiosInstance.post(`/phantom/${sessionId}/generate-report`);
};

// fixed: URL changed from /code to /ai-question (matches router below)
export const addQuestion = (sessionId) => {
  return axiosInstance.post(`/phantom/${sessionId}/ai-question`);
};
