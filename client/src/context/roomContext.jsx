import { createContext, useState } from "react";
import {
  createRoom,
  getRooms,
  getRoom,
  joinRoom,
  endRoom,
  saveSnapshot,
  hesitation,
  summary,
  addProblem,
  updateProblem,
  updateNotes,
  generateReport,
  editProblem,
  getRoomDetail,
  blockCandidate,
} from "../api/roomAPI.jsx";

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  async function handleCreateRoom() {
    setLoading(true);
    setError(null);
    try {
      const response = await createRoom();
      setRoom(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleGetAllRooms() {
    setLoading(true);
    setError(null);
    try {
      const response = await getRooms();
      setRooms(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRoom(roomId) {
    setLoading(true);
    setError(null);
    try {
      const response = await getRoom(roomId);
      setRoom(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(roomId) {
    setLoading(true);
    setError(null);
    try {
      const response = await joinRoom(roomId);
      setRoom(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleEndRoom(roomId) {
    setLoading(true);
    setError(null);
    try {
      const response = await endRoom(roomId);
      setRoom(response.data.data);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      if (message === "Room is already over") return;
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSnapshot(roomId, snapshots) {
    setLoading(true);
    setError(null);
    try {
      const response = await saveSnapshot(roomId, snapshots);
      setRoom((prev) => ({ ...prev, codeSnapshots: response.data.data }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleHesitation(roomId, hesitations) {
    setLoading(true);
    setError(null);
    try {
      const response = await hesitation(roomId, hesitations);
      setRoom((prev) => ({ ...prev, hesitations: response.data.data }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleSummary(roomId) {
    setLoading(true);
    setError(null);
    try {
      const response = await summary(roomId);
      setRoom((prev) => ({
        ...prev,
        summary:
          response.data.data ??
          "No problems in the room to generate the summary",
      }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProblem(roomId, problem) {
    setLoading(true);
    setError(null);
    try {
      const response = await addProblem(roomId, problem);
      setRoom((prev) => ({ ...prev, problem: response.data.data }));
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProblem(roomId, problemId, finalCode, duration) {
    setLoading(true);
    setError(null);
    try {
      const response = await updateProblem(
        roomId,
        problemId,
        finalCode,
        duration,
      );
      setRoom((prev) => ({
        ...prev,
        problem: prev.problem.map((p) =>
          p.problemId === problemId ? response.data.data : p,
        ),
      }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleEditProblem(roomId, problemId, problem) {
    setLoading(true);
    setError(null);
    try {
      const response = await editProblem(roomId, problemId, problem);
      setRoom((prev) => ({
        ...prev,
        problem: prev.problem.map((p) =>
          p.problemId === problemId ? response.data.data : p,
        ),
      }));
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateNotes(roomId, notes) {
    setLoading(true);
    setError(null);
    try {
      const response = await updateNotes(roomId, notes);
      setRoom((prev) => ({ ...prev, notes: response.data.data }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // async function handleUpdateLanguage(roomId, language) {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await updateLanguage(roomId, language);
  //     setRoom((prev) => ({ ...prev, language: response.data.data }));
  //   } catch (error) {
  //     setError(error.response?.data?.message || error.message);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleGenerateReport(roomId) {
    setLoading(true);
    setError(null);
    try {
      const response = await generateReport(roomId);
      // response.data.data is the parsed object — stringify it so InterviewerNotes can JSON.parse it
      setRoom((prev) => ({
        ...prev,
        report: JSON.stringify(response.data.data),
      }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockCandidate(roomId) {
    setLoading(true);
    setError(null);
    try {
      await blockCandidate(roomId);
      // no state update needed — block just sets a flag on the DB
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  async function handleGetRoomDetail(roomId) {
  setLoading(true);
  setError(null);
  try {
    const response = await getRoomDetail(roomId);
    setRoom(response.data.data);
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  } finally {
    setLoading(false);
  }
}

  function clearRoom() {
    setRoom(null);
    setError(null);
  }

  function clearError() {
    setError(null);
  }

  return (
    <RoomContext.Provider
      value={{
        loading,
        error,
        room,
        rooms,
        handleCreateRoom,
        handleGetAllRooms,
        handleGetRoom,
        handleJoinRoom,
        handleEndRoom,
        handleSaveSnapshot,
        handleHesitation,
        handleSummary,
        handleAddProblem,
        handleUpdateProblem,
        handleEditProblem,
        handleUpdateNotes,
        handleGenerateReport,
        clearRoom,
        clearError,
        handleBlockCandidate,
        handleGetRoomDetail,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
