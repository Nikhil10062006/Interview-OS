import axiosInstance from "./axiosInstance.jsx";

export const createRoom = () => axiosInstance.post("/warroom/create");
export const getRooms = () => axiosInstance.get("/warroom/all-rooms");
export const getRoom = (roomId) => axiosInstance.get(`/warroom/${roomId}`);
export const joinRoom = (roomId) =>
  axiosInstance.post(`/warroom/${roomId}/join`);
export const endRoom = (roomId) =>
  axiosInstance.patch(`/warroom/${roomId}/end`);
export const saveSnapshot = (roomId, snapshots) =>
  axiosInstance.post(`/warroom/${roomId}/snapshot`, { snapshots });
export const replaySnap = (roomId) =>
  axiosInstance.get(`/warroom/${roomId}/replay`);
export const hesitation = (roomId, hesitations) =>
  axiosInstance.post(`/warroom/${roomId}/hesitation`, {
    hesitations,
  });
export const roomHeatMap = (roomId) =>
  axiosInstance.get(`/warroom/${roomId}/heatmap`);
export const summary = (roomId) =>
  axiosInstance.post(`/warroom/${roomId}/summary`);
export const addProblem = (roomId, problem) =>
  axiosInstance.post(`/warroom/${roomId}/problem`, problem);
export const updateProblem = (roomId, problemId, finalCode, duration) =>
  axiosInstance.patch(`/warroom/${roomId}/problem/${problemId}`, {
    finalCode,
    duration,
  });
export const updateNotes = (roomId, notes) =>
  axiosInstance.patch(`/warroom/${roomId}/notes`, { notes });
export const generateReport = (roomId) =>
  axiosInstance.post(`/warroom/${roomId}/generate-report`);

export const editProblem = (roomId, problemId, problem) =>
  axiosInstance.patch(`/warroom/${roomId}/problem/${problemId}/edit`, problem);
export const blockCandidate = (roomId) =>
  axiosInstance.patch(`/warroom/${roomId}/block-candidate`);
export const saveTestCases = (roomId, problemId, testCases) =>
  axiosInstance.post(`/warroom/${roomId}/problem/${problemId}/testcases`, {
    testCases,
  });
  export const getRoomDetail = (roomId) => 
  axiosInstance.get(`/warroom/${roomId}/detail`);
