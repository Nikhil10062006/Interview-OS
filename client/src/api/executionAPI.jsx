import axiosInstance from "./axiosInstance.jsx";

export const runCode = async (language, code, input = "") => {
  const response = await axiosInstance.post("/execution/execute", {
    language,
    code,
    input,
  });
  return response.data.data;
};
