import {
  startSession,
  getSession,
  getAllSessions,
  hesitation,
  addSnapshot,
  addQuesAndAns,
  updateLanguage,
  updateFinalCode,
  endSession,
  generateReport,
  addQuestion,
} from "../api/mockAPI.jsx";
import { useState, createContext } from "react";

export const MockContext = createContext(); // exported so useMockRoom hook can import it

export const MockProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);

  async function handleStartSession(formFields) {
    setLoading(true);
    setError(null);
    setSession(null);
    try {
      const response = await startSession(formFields);
      if (!response) {
        setError("Error starting session");
        return;
      }
      setSession(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetSession(sessionId) {
    setLoading(true);
    setError(null);
    try {
      const response = await getSession(sessionId);
      if (!response) {
        setError("Error fetching session");
        return;
      }
      setSession(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err; // rethrow so callers can catch
    } finally {
      setLoading(false);
    }
  }

  async function handleGetAllSessions() {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllSessions();
      if (!response) {
        setError("Error fetching sessions");
        return;
      }
      setSessions(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  // sends whole array at once — backend uses $each
  async function handleHesitation(sessionId, hesitationsArray) {
    //setLoading(true);
    setError(null);
    try {
      if (!hesitationsArray || hesitationsArray.length === 0) return;
      await hesitation(sessionId, hesitationsArray);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      //setLoading(false);
    }
  }

  // no setLoading — background op, would flash spinners every 10s
  async function handleAddSnapshot(sessionId, code) {
    try {
      const response = await addSnapshot(sessionId, code);
      if (!response) return;
      setSession((prev) => ({ ...prev, codeSnapShots: response.data.data }));
    } catch (err) {
      console.error("Snapshot save failed:", err.message);
    }
  }

  // added question param — backend requires { question, answer, duration }
  async function handleAddQuesAndAns(
    sessionId,
    problemIdx,
    question,
    answer,
    duration,
  ) {
    //setLoading(true);
    setError(null);
    try {
      const response = await addQuesAndAns(
        sessionId,
        problemIdx,
        question,
        answer,
        duration,
      );
      if (!response) {
        setError("Error saving Q&A");
        return;
      }
      setSession((prev) => ({
        ...prev,
        problem: prev.problem.map((p, index) =>
          index === problemIdx ? { ...p, quesAndAns: response.data.data } : p,
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      //setLoading(false);
    }
  }

  async function handleUpdateLanguage(sessionId, language) {
    //setLoading(true);
    setError(null);
    try {
      const response = await updateLanguage(sessionId, language);
      if (!response) {
        setError("Error updating language");
        return;
      }
      setSession((prev) => ({ ...prev, language: response.data.data }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      //setLoading(false);
    }
  }

  async function handleUpdateFinalCode(sessionId, finalCode, idx, duration) {
    setLoading(true);
    setError(null);
    try {
      const response = await updateFinalCode(
        sessionId,
        finalCode,
        idx,
        duration,
      );
      if (!response) {
        setError("Error saving final code");
        return;
      }
      setSession((prev) => ({
        ...prev,
        problem: prev.problem.map((p, index) =>
          index === idx ? response.data.data : p,
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEndSession(sessionId) {
    setLoading(true);
    setError(null);
    try {
      const response = await endSession(sessionId);
      if (!response) {
        setError("Error ending session");
        return;
      }
      setSession(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateReport(sessionId) {
    setLoading(true);
    setError(null);
    try {
      const response = await generateReport(sessionId);
      if (!response) {
        setError("Error generating report");
        return;
      }
      setSession((prev) => ({ ...prev, report: response.data.data }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  // no setLoading — silent background call, returns question string to caller
  async function handleAddQuestion(sessionId) {
    try {
      const response = await addQuestion(sessionId);
      return response.data.data; // question string
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    }
  }

  return (
    <MockContext.Provider
      value={{
        loading,
        session,
        sessions,
        error,
        handleStartSession,
        handleGetSession,
        handleGetAllSessions,
        handleHesitation,
        handleAddSnapshot,
        handleAddQuesAndAns,
        handleUpdateLanguage,
        handleUpdateFinalCode,
        handleEndSession,
        handleGenerateReport,
        handleAddQuestion,
      }}
    >
      {children}
    </MockContext.Provider>
  );
};
