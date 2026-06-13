import { roomSocket } from "../socket/roomSocket.jsx";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth.jsx";
import { updateProblem, saveTestCases } from "../api/roomAPI.jsx";

export const useRoomSocket = (roomId, room) => {
  const [language, setLanguage] = useState("javascript");
  const [problem, setProblem] = useState(null);
  const [onlineParticipants, setOnlineParticipants] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [runResult, setRunResult] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [roomEnded, setRoomEnded] = useState(false);
  const [remoteCode, setRemoteCode] = useState(null);
  const [editorResetTrigger, setEditorResetTrigger] = useState(0);

  const { user } = useAuth();
  const socketInitialized = useRef(false);
  const currentProblemRef = useRef(null);
  const endingRef = useRef(false);
  const problemStartTimeRef = useRef(null);
  const currentCodeRef = useRef("");
  const candidateIdRef = useRef(null); // fix: avoid stale closure in next-problem

  useEffect(() => {
    if (!room || !user) return;
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    if (room.candidate) {
      setCandidate(room.candidate);
      candidateIdRef.current = String(room.candidate?._id ?? room.candidate);
    }
    setLanguage(room.language || "javascript");
    roomSocket.auth.token = localStorage.getItem("accessToken");

    if (roomSocket.connected) {
      roomSocket.emit("join-room", roomId);
    }

    roomSocket.on("connect", () => {
      roomSocket.emit("join-room", roomId);
    });

    roomSocket.on("room-participants", (participantIds) => {
      setOnlineParticipants(participantIds);
    });

    roomSocket.on("candidate-joined", (incomingCandidate) => {
      setCandidate(incomingCandidate);
      candidateIdRef.current = String(incomingCandidate._id); // keep ref in sync
    });

    roomSocket.on("code-change", (incomingCode) => {
      if (incomingCode === currentCodeRef.current) return;
      currentCodeRef.current = incomingCode;
      setRemoteCode(incomingCode);
    });

    roomSocket.on("language-change", (incomingLanguage) => {
      setLanguage(incomingLanguage);
    });

    roomSocket.on("problem-update", (incomingProblem) => {
      setProblem(incomingProblem);
      setTestCases(incomingProblem.testCases || []);
      currentProblemRef.current = incomingProblem;
      problemStartTimeRef.current = Date.now();
      currentCodeRef.current = "";
      setEditorResetTrigger((prev) => prev + 1);
    });

    roomSocket.on("test-cases-update", ({ testCases }) => {
      setTestCases(testCases);
    });

    roomSocket.on("run-result", (result) => {
      setRunResult(result);
    });

    roomSocket.on("interview-ended", () => {
      endingRef.current = true; // ADD this
      setRoomEnded(true);
    });

    roomSocket.on("next-problem", async () => {
      // fix: use ref instead of stale closure over room.candidate
      const isCandidate =
        candidateIdRef.current && candidateIdRef.current === String(user._id);

      if (isCandidate && currentProblemRef.current?.problemId) {
        const duration = problemStartTimeRef.current
          ? Math.floor((Date.now() - problemStartTimeRef.current) / 1000)
          : 0;
        try {
          await updateProblem(
            roomId,
            currentProblemRef.current.problemId,
            currentCodeRef.current,
            duration,
          );
        } catch (err) {
          console.error("Failed to save final code:", err);
        }
      }
      currentCodeRef.current = "";
      setProblem(null);
      setTestCases([]);
      currentProblemRef.current = null;
      problemStartTimeRef.current = null;
    });

    roomSocket.on("user-left", ({ userId }) => {
      console.log(`User ${userId} left the room`);
    });

    roomSocket.connect();

    return () => {
      socketInitialized.current = false;
      roomSocket.emit("leave-room", roomId);

      const isCandidate =
        candidateIdRef.current && candidateIdRef.current === String(user._id);

      // endingRef prevents double-save when room ends normally via interview-ended event
      if (
        isCandidate &&
        !endingRef.current &&
        currentProblemRef.current?.problemId &&
        currentCodeRef.current
      ) {
        const duration = problemStartTimeRef.current
          ? Math.floor((Date.now() - problemStartTimeRef.current) / 1000)
          : 0;
        updateProblem(
          roomId,
          currentProblemRef.current.problemId,
          currentCodeRef.current,
          duration,
        ).catch((err) => console.error("Failed to save code on leave:", err));
      }

      roomSocket.off();
      roomSocket.disconnect();
    };
  }, [room?.roomId, user?._id]); // fix: stable primitives only, no object refs

  function handleCodeChange(newCode) {
    // fix: removed isRemoteChange guard — was blocking valid local changes
    currentCodeRef.current = newCode;
    roomSocket.emit("code-change", { roomId, code: String(newCode) });
  }

  function handleLanguageChange(newLanguage) {
    setLanguage(newLanguage);
    roomSocket.emit("language-change", {
      roomId,
      language: String(newLanguage),
    });
  }

  function handleProblemUpdate(newProblem) {
    const plainProblem = JSON.parse(JSON.stringify(newProblem));
    setProblem(plainProblem);
    currentProblemRef.current = plainProblem;
    problemStartTimeRef.current = Date.now();
    currentCodeRef.current = "";
    setEditorResetTrigger((prev) => prev + 1);
    roomSocket.emit("problem-update", { roomId, problem: plainProblem });
  }

  async function handleTestCasesUpdate(problemId, newTestCases) {
    setTestCases(newTestCases);
    roomSocket.emit("test-cases-update", {
      roomId,
      problemId,
      testCases: newTestCases,
    });
    try {
      await saveTestCases(roomId, problemId, newTestCases);
    } catch (err) {
      console.error("Failed to save test cases:", err);
    }
  }

  function handleEndInterview() {
    roomSocket.emit("interview-ended", roomId);
  }

  function handleRunResult(result) {
    setRunResult(result);
    roomSocket.emit("run-result", { roomId, result });
  }

  function handleNextProblem() {
    currentCodeRef.current = "";
    setProblem(null);
    setTestCases([]);
    currentProblemRef.current = null;
    problemStartTimeRef.current = null;
    roomSocket.emit("next-problem", { roomId });
  }

  function handleLeaveRoom() {
    roomSocket.emit("leave-room", roomId);
    setOnlineParticipants((prev) => prev.filter((id) => id !== user._id));
    roomSocket.off();
    roomSocket.disconnect();
  }

  return {
    language,
    problem,
    onlineParticipants,
    testCases,
    runResult,
    candidate,
    roomEnded,
    editorResetTrigger,
    remoteCode,
    handleCodeChange,
    handleLanguageChange,
    handleLeaveRoom,
    handleProblemUpdate,
    handleTestCasesUpdate,
    handleRunResult,
    handleEndInterview,
    handleNextProblem,
  };
};
