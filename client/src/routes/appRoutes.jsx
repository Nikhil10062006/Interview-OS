import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./protectedRoute.jsx";
import Landing from "../pages/landing.jsx";
import Login from "../pages/auth/login.jsx";
import Register from "../pages/auth/register.jsx";
import DashboardPage from "../pages/dashboard/dashboardPage.jsx";
import Lobby from "../pages/warroom/lobby.jsx";
import LiveRoom from "../pages/warroom/liveRoom.jsx";
import AllRooms from "../pages/warroom/allRooms.jsx";
import RoomSummary from "../pages/warroom/roomSummary.jsx";
import LiveSession from "../pages/phantom/liveSession.jsx";
import LobbyAI from "../pages/phantom/lobbyAI.jsx";
import SessionSummary from "../pages/phantom/sessionSummary.jsx";
import AllSessions from "../pages/phantom/allSessions.jsx";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warroom"
        element={
          <ProtectedRoute>
            <Lobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warroom/all-rooms"
        element={
          <ProtectedRoute>
            <AllRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warroom/:roomId"
        element={
          <ProtectedRoute>
            <LiveRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warroom/:roomId/detail"
        element={
          <ProtectedRoute>
            <RoomSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phantom"
        element={
          <ProtectedRoute>
            <LobbyAI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phantom/all-sessions"
        element={
          <ProtectedRoute>
            <AllSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phantom/:sessionId/summary"
        element={
          <ProtectedRoute>
            <SessionSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/phantom/:sessionId"
        element={
          <ProtectedRoute>
            <LiveSession />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
