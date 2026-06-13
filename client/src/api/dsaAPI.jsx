import axiosInstance from "./axiosInstance.jsx";

export const addDSAQuestion = (question, questionLink, topic, difficulty) => {
  return axiosInstance.post("/dsa/add", { question, questionLink, topic, difficulty });
};

export const getQuestions = () => {
  return axiosInstance.get("/dsa/");
};

export const getQues = (problemId) => {
  return axiosInstance.get(`/dsa/${problemId}`);
};

export const updateFields = (problemId, field, value) => {
  return axiosInstance.patch(`/dsa/${problemId}/update`, { field, value });
};

export const deleteQuestion = (problemId) => {
  return axiosInstance.delete(`/dsa/${problemId}`);
};

export const getSolHistory = (problemId) => {
  return axiosInstance.get(`/dsa/${problemId}/history`);
};

export const toggleBookMark = (problemId) => {
  return axiosInstance.patch(`/dsa/${problemId}/bookmark`);
};

export const resetSR = (problemId) => {
  return axiosInstance.post(`/dsa/${problemId}/reset`);
};

export const getStats = () => {
  return axiosInstance.get("/dsa/stats");
};

export const getDueQues = () => {
  return axiosInstance.get("/dsa/due");
};

export const review = (problemId, quality, solution, remarks) => {
  return axiosInstance.post(`/dsa/${problemId}/review`, { quality, solution, remarks });
};

export const getSeededQuestions = (filters = {}) => {
  return axiosInstance.get("/dsa/seeded", { params: filters});
};