import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoom } from "../../hooks/useRoom.jsx";
import { useRoomSocket } from "../../hooks/useRoomSocket.jsx";
import { useHesitation } from "../../hooks/useHesitation.jsx";
import { useTabSwitch } from "../../hooks/useTabSwitch.jsx";
import { useCodeSnapshots } from "../../hooks/useCodeSnapShots.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { updateProblem } from "../../api/roomAPI.jsx";

import Spinner from "../../components/spinner.jsx";
import CodeEditor from "../../components/codeWrapper.jsx";
import Toast from "../../components/toast.jsx";
import Modal from "../../components/modal.jsx";
import OutputPanel from "./components/outputPanel.jsx";
import ProblemPanel from "./components/problemPanel.jsx";
import RoomHeader from "./components/roomHeader.jsx";
import ParticipantPanel from "./components/participantPanel.jsx";
import PreRoomSetup from "./components/preRoomSetup.jsx";
import TabSwitchWarning from "./components/tabSwitchWarning.jsx";
import LanguageSelector from "../../components/languageSelector.jsx";
import InterviewerNotes from "./components/interviewerNotes.jsx";
import MeetingEnded from "./components/meetingEnded.jsx";

const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 520;
const DEFAULT_PANEL_WIDTH = 320;

const MIN_BOTTOM_HEIGHT = 120;
const DEFAULT_BOTTOM_HEIGHT = 240;

export default function LiveRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  // const editorUpdateTimer = useRef(null);
  const latestCodeRef = useRef("");
  const [status, setStatus] = useState("loading");
  const [granted, setGranted] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [forceKicked, setForceKicked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const { toast, showToast } = useToast();
  const { user } = useAuth();

  // ─── layout (resizable panels) ───
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [bottomHeight, setBottomHeight] = useState(DEFAULT_BOTTOM_HEIGHT);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_PANEL_WIDTH);

  const isDraggingBottom = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(DEFAULT_BOTTOM_HEIGHT);

  const onMouseDown = useCallback(
    (e) => {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragStartWidth.current = panelWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [panelWidth],
  );

  const onMouseDownBottom = useCallback(
    (e) => {
      isDraggingBottom.current = true;
      dragStartY.current = e.clientY;
      dragStartHeight.current = bottomHeight;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [bottomHeight],
  );

  useEffect(() => {
    function onMouseMove(e) {
      if (isDragging.current) {
        const delta = e.clientX - dragStartX.current;
        const next = Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, dragStartWidth.current + delta),
        );
        setPanelWidth(next);
      }
      if (isDraggingBottom.current) {
        const delta = dragStartY.current - e.clientY;
        const next = Math.min(
          window.innerHeight * 0.6,
          Math.max(MIN_BOTTOM_HEIGHT, dragStartHeight.current + delta),
        );
        setBottomHeight(next);
      }
    }
    function onMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
      if (isDraggingBottom.current) {
        isDraggingBottom.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const {
    handleGetRoom,
    room,
    loading: roomLoading,
    handleBlockCandidate,
    handleSaveSnapshot,
    handleGenerateReport,
    handleHesitation,
    handleEndRoom,
  } = useRoom();

  const isInterviewer =
    room &&
    user &&
    String(room.interviewer?._id ?? room.interviewer) === String(user._id);

  async function handleCandidateLeaveRoom() {
    try {
      await handleBlockCandidate(roomId);
    } catch {}
    handleLeaveRoom();
    navigate("/dashboard");
  }

  const {
    language,
    problem,
    onlineParticipants,
    testCases,
    runResult,
    candidate,
    roomEnded,
    remoteCode,
    editorResetTrigger,
    handleCodeChange,
    handleLanguageChange,
    handleProblemUpdate,
    handleTestCasesUpdate,
    handleRunResult,
    handleLeaveRoom,
    handleNextProblem,
    handleEndInterview,
  } = useRoomSocket(roomId, room);

  const { handleTyping, hesitationsArray } = useHesitation();
  const snapshotsRef = useCodeSnapshots(latestCodeRef, language);
  const { violationCount, isWarningVisible, dismissWarning } = useTabSwitch(
    !isInterviewer,
    handleCandidateLeaveRoom,
  );

  useEffect(() => {
    if (room?.roomId === roomId) {
      setStatus("ready");
      return;
    }
    handleGetRoom(roomId)
      .then(() => setStatus("ready"))
      .catch((error) => {
        const message = error.response?.data?.message || "Failed to load room";
        setErrorMessage(message);
        setStatus("error");
      });
  }, [roomId]);

  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (roomEnded && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [roomEnded]);
  useEffect(() => {
    if (editorResetTrigger === 0) return; // skip on mount
    setEditorCode("");
    latestCodeRef.current = "";
  }, [editorResetTrigger]);

  // useEffect(() => {
  //   if (isInterviewer && candidate) {
  //     setTimeout(() => {
  //       if (latestCodeRef.current) handleCodeChange(latestCodeRef.current);
  //       if (testCases?.length && problem?.problemId) {
  //         handleTestCasesUpdate(problem.problemId, testCases);
  //       }
  //     }, 800);
  //   }
  // }, [candidate, isInterviewer]);

  useEffect(() => {
    if (!roomEnded || isInterviewer) return;
    handleHesitation(roomId, hesitationsArray).catch((e) =>
      console.error("Candidate context save error:", e),
    );
  }, [roomEnded, isInterviewer, roomId, hesitationsArray]);

  useEffect(() => {
    if (remoteCode === null) return;
    setEditorCode(remoteCode);
    latestCodeRef.current = remoteCode;
  }, [remoteCode]);

  async function onEndRoom() {
    if (isEnding) return;
    setIsEnding(true);
    handleEndInterview();
    if (problem && problem.problemId) {
      try {
        await updateProblem(
          roomId,
          problem.problemId,
          latestCodeRef.current,
          0,
        );
      } catch (e) {
        console.error("Failed to automatically back up final problem code:", e);
      }
    }

    try {
      await handleSaveSnapshot(roomId, snapshotsRef.current);
    } catch (e) {
      console.error("Snapshot save failed:", e);
    }

    setTimeout(async () => {
      try {
        await handleEndRoom(roomId);
        await handleGenerateReport(roomId);
      } catch (e) {
        console.error("End room / report generation failed:", e);
        showToast("Failed to safely finalize workspace summary details", false);
        setIsEnding(false);
      }
    }, 1000);
  }

  if (status === "loading") return <Spinner />;

  if (status === "error")
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white gap-4">
        <p className="text-red-400 font-mono text-sm">{errorMessage}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-indigo-400 hover:text-indigo-300 font-mono text-sm border border-indigo-800 px-4 py-2 rounded-lg"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );

  if (forceKicked)
    return (
      <Modal
        isOpen
        onClose={() => navigate("/dashboard")}
        title="Maximum tab switches reached. You have been removed from the room."
      />
    );

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {!granted && <PreRoomSetup onSuccess={() => setGranted(true)} />}
      {granted && (
        <div className="flex flex-col h-full overflow-hidden">
          {!isInterviewer && isWarningVisible && violationCount < 3 && (
            <TabSwitchWarning onDismiss={dismissWarning} />
          )}
          <RoomHeader onEndRoom={onEndRoom} />

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Participants + Problem */}
            <div
              className="flex flex-col shrink-0 overflow-hidden border-r border-gray-800"
              style={{ width: panelWidth }}
            >
              <ParticipantPanel
                onlineParticipants={onlineParticipants}
                candidate={candidate}
              />
              <div className="flex-1 overflow-hidden">
                <ProblemPanel
                  problem={problem}
                  onProblemUpdate={handleProblemUpdate}
                  currentCode={editorCode}
                  onNextProblem={handleNextProblem}
                  testCases={testCases}
                  onTestCasesUpdate={handleTestCasesUpdate}
                  currentProblemId={problem?.problemId}
                  isInterviewer={isInterviewer}
                />
              </div>
            </div>

            {/* Drag handle */}
            <div
              onMouseDown={onMouseDown}
              className="w-1 shrink-0 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors duration-150 active:bg-indigo-400"
            />

            {/* Right: Editor + Output */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Language bar */}
              <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
                {isInterviewer ? (
                  <span className="px-3 py-1.5 text-xs font-medium font-mono text-zinc-400 border border-zinc-700 rounded-lg bg-zinc-900/50">
                    {language}
                  </span>
                ) : (
                  <LanguageSelector
                    value={language}
                    onChange={handleLanguageChange}
                  />
                )}
              </div>

              {/* Editor — takes remaining vertical space */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={editorCode}
                  language={language}
                  readOnly={isInterviewer}
                  onChange={(val) => {
                    if (isInterviewer) return;
                    if (val === latestCodeRef.current) return; // Cursor Jump Protection

                    setEditorCode(val);
                    latestCodeRef.current = val; // Synchronize immediately
                    handleCodeChange(val);
                    handleTyping(val);
                  }}
                />
              </div>

              {/* Drag handle for output panel */}
              <div
                onMouseDown={onMouseDownBottom}
                className="h-1 shrink-0 bg-gray-800 hover:bg-indigo-500 cursor-row-resize transition-colors duration-150 active:bg-indigo-400"
              />

              {/* Output panel */}
              <div
                className="shrink-0 overflow-hidden"
                style={{ height: `${bottomHeight}px` }}
              >
                <OutputPanel
                  code={editorCode}
                  language={language}
                  onResult={isInterviewer ? undefined : handleRunResult}
                  externalResult={isInterviewer ? runResult : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          success={toast.success}
          error={!toast.success}
        />
      )}
      {roomEnded && isInterviewer && <InterviewerNotes />}
      {roomEnded && !isInterviewer && <MeetingEnded />}
    </div>
  );
}
