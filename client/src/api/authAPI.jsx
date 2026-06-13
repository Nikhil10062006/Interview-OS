import axiosInstance from "./axiosInstance.jsx";

export const register = (username, email, password) => {
    return axiosInstance.post("/users/register", { username, email, password });
};

export const login = (email, password) => {
  return axiosInstance.post("/users/login", { email, password });
};

export const getUser = () => {
  return axiosInstance.get("/users/me");
};

export const logout = () => {
  return axiosInstance.post("/users/logout");
};
export const refreshGeneration = () => {
  return axiosInstance.get("/users/refresh-token");
};

export const updatePassword = (oldPassword, newPassword) => {
  return axiosInstance.patch("/users/update-password", {
    oldPassword,
    newPassword,
  });
};

export const updateAccount = (username, email) => {
  return axiosInstance.patch("/users/update-account", { username, email });
};
