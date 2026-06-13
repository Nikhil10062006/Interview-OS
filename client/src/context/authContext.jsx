import { createContext, useState, useEffect } from "react";
import {
  register as registerAPI,
  login as loginAPI,
  getUser,
  logout as logoutAPI,
} from "../api/authAPI.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const response = await getUser();
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Access Token is invalid or expired", error);
          localStorage.removeItem("accessToken");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // handleRegister — just return response.data, it already has success + message
  const handleRegister = async (username, email, password) => {
    try {
      const response = await registerAPI(username, email, password);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong",
      };
    }
  };

  // handleLogin — destructure from .data.data, return response.data
  const handleLogin = async (email, password) => {
    try {
      const response = await loginAPI(email, password);
      console.log(response.data);
      const { accessToken, loggedInUser  } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
