import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMockRoom } from "../../hooks/useMock.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import { useHesitation } from "../../hooks/useHesitation.jsx";
import Toast from "../../components/toast.jsx";
import Spinner from "../../components/spinner.jsx";
import CodeEditor from "../../components/codeWrapper.jsx";
import ProblemPanel from "./components/problemPanel.jsx";
import OutputPanel from "./components/outputPanel.jsx";
import SessionHeader from "./components/sessionHeader.jsx";
import AIQuestionPanel from "./components/aiQuestionPanel.jsx";
import ReportOverlay from "./components/reportOverlay.jsx";
import LanguageSelector from "../../components/languageSelector.jsx";

const SNAPSHOT_INTERVAL = 16 * 1000;
const AI_QUESTION_INTERVAL = 2 * 60 * 1000;
const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 360;

export default function LiveSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [idx, setIdx] = useState(0);
  const [editorCode, setEditorCode] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [questionResetKey, setQuestionResetKey] = useState(0);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [bottomHeight, setBottomHeight] = useState(220);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_PANEL_WIDTH);
  const isDraggingBottom = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(220);

  const idxRef = useRef(0);
  const currentQuestionRef = useRef(null);
  const currentAnswerRef = useRef("");
  const editorCodeRef = useRef("");
  const snapshotTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const aiIgnoreRef = useRef(false);
  const problemStartTimeRef = useRef(Date.now());
  const questionReceivedAt = useRef(null);

  const { toast, showToast } = useToast();

  const {
    session,
    error: mockError,
    handleGetSession,
    handleEndSession,
    handleHesitation,
    handleAddQuesAndAns,
    handleGenerateReport,
    handleUpdateLanguage,
    handleUpdateFinalCode,
    handleAddSnapshot,
    handleAddQuestion,
  } = useMockRoom();

  const { handleTyping, hesitationsArray } = useHesitation();

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
          window.innerHeight * 0.7,
          Math.max(100, dragStartHeight.current + delta),
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

  // Effect 1: trigger fetch on mount
  useEffect(() => {
    async function init() {
      if (session?.sessionId === sessionId) {
        if (session.status === "ended") {
          navigate(`/phantom/${sessionId}/summary`);
          return;
        }
        problemStartTimeRef.current = Date.now();
        setStatus("ready");
        return;
      }
      try {
        await handleGetSession(sessionId);
      } catch {
        setStatus("error");
      }
    }
    init();
  }, [sessionId]);

  // Effect 2: react to session populating in context
  useEffect(() => {
    if (!session || session.sessionId !== sessionId) return;
    if (status === "ready") return;
    if (session.status === "ended") {
      navigate(`/phantom/${sessionId}/summary`);
      return;
    }
    problemStartTimeRef.current = Date.now();
    setStatus("ready");
  }, [session]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    if (status !== "ready") return;
    startTimers();
    return () => clearTimers();
  }, [status]);

  useEffect(() => {
    if (mockError) showToast(mockError, false);
  }, [mockError]);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  function startTimers() {
    snapshotTimerRef.current = setInterval(() => {
      if (editorCodeRef.current)
        handleAddSnapshot(sessionId, editorCodeRef.current);
    }, SNAPSHOT_INTERVAL);

    aiTimerRef.current = setInterval(async () => {
      const currentIdx = idxRef.current;

      if (currentQuestionRef.current) {
        const duration = questionReceivedAt.current
          ? Math.floor((Date.now() - questionReceivedAt.current) / 1000)
          : 0;
        handleAddQuesAndAns(
          sessionId,
          currentIdx,
          currentQuestionRef.current,
          currentAnswerRef.current, // ← save whatever user typed, even if partial
          duration,
        );
        currentQuestionRef.current = null;
        questionReceivedAt.current = null;
        currentAnswerRef.current = "";
        setCurrentAnswer("");
        setCurrentQuestion(null);
        setQuestionResetKey((prev) => prev + 1);
      }

      const question = await handleAddQuestion(sessionId);
      if (question && !aiIgnoreRef.current) {
        currentQuestionRef.current = question;
        questionReceivedAt.current = Date.now();
        setCurrentQuestion(question);
      }
    }, AI_QUESTION_INTERVAL);
  }

  function clearTimers() {
    clearInterval(snapshotTimerRef.current);
    clearInterval(aiTimerRef.current);
  }

  async function onEndRoom() {
    if (isEnding) return;
    setIsEnding(true);
    clearTimers();

    // flush any in-progress question+answer before ending
    if (currentQuestionRef.current) {
      const duration = questionReceivedAt.current
        ? Math.floor((Date.now() - questionReceivedAt.current) / 1000)
        : 0;
      await handleAddQuesAndAns(
        sessionId,
        idxRef.current,
        currentQuestionRef.current,
        currentAnswerRef.current,
        duration,
      );
      currentQuestionRef.current = null;
      questionReceivedAt.current = null;
    }

    try {
      const elapsed = Math.floor(
        (Date.now() - problemStartTimeRef.current) / 1000,
      );
      await handleUpdateFinalCode(sessionId, editorCode, idx, elapsed);
      await handleAddSnapshot(sessionId, editorCode || "// session ended");
      await handleHesitation(sessionId, hesitationsArray);
      await handleEndSession(sessionId);
      setTimeout(async () => {
        try {
          setIsGeneratingReport(true);
          await handleGenerateReport(sessionId);
          setShowReport(true);
        } catch {
          showToast(
            "Failed to generate report. Try again from your sessions.",
            false,
          );
        } finally {
          setIsGeneratingReport(false);
          setIsEnding(false);
        }
      }, 1000);
    } catch {
      showToast("Failed to end session", false);
      setIsEnding(false);
    }
  }

  async function handleNextProblem() {
    if (!session?.problem || idx >= session.problem.length - 1) return;

    aiIgnoreRef.current = true;
    clearTimers();

    // flush current question before moving to next problem
    if (currentQuestionRef.current) {
      const duration = questionReceivedAt.current
        ? Math.floor((Date.now() - questionReceivedAt.current) / 1000)
        : 0;
      await handleAddQuesAndAns(
        sessionId,
        idxRef.current,
        currentQuestionRef.current,
        currentAnswerRef.current,
        duration,
      );
      currentQuestionRef.current = null;
      questionReceivedAt.current = null;
    }

    const elapsed = Math.floor(
      (Date.now() - problemStartTimeRef.current) / 1000,
    );
    await handleUpdateFinalCode(sessionId, editorCode, idx, elapsed);
    await handleAddSnapshot(sessionId, "// New problem");

    const nextIdx = idx + 1;
    idxRef.current = nextIdx;
    problemStartTimeRef.current = Date.now();
    setIdx(nextIdx);
    setEditorCode("");
    editorCodeRef.current = "";
    currentAnswerRef.current = "";
    setCurrentAnswer("");
    setCurrentQuestion(null);
    setQuestionResetKey((prev) => prev + 1);

    aiIgnoreRef.current = false;
    startTimers();
  }
  function handleAnswer(answer) {
    const duration = questionReceivedAt.current
      ? Math.floor((Date.now() - questionReceivedAt.current) / 1000)
      : 0;
    handleAddQuesAndAns(
      sessionId,
      idxRef.current,
      currentQuestion,
      answer,
      duration,
    );
    currentQuestionRef.current = null;
    questionReceivedAt.current = null;
    currentAnswerRef.current = "";
    setCurrentAnswer("");
    setCurrentQuestion(null);
  }

  if (status === "loading" || !session) return <Spinner />;
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 font-mono text-sm">
          This session has ended or could not be found.
        </p>
        <button
          onClick={() => navigate("/phantom/all-sessions")}
          className="text-indigo-400 hover:text-indigo-300 font-mono text-xs border border-indigo-800/50 px-4 py-2 rounded-lg transition-colors"
        >
          View All Sessions
        </button>
        <button
          onClick={() => navigate(`/phantom/${sessionId}/summary`)}
          className="text-gray-500 hover:text-gray-300 font-mono text-xs transition-colors"
        >
          Try opening summary →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white font-mono">
      <SessionHeader onEndSession={onEndRoom} isEnding={isEnding} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex flex-col shrink-0 overflow-hidden border-r border-gray-800"
          style={{ width: panelWidth }}
        >
          <ProblemPanel
            onNextProblem={handleNextProblem}
            currentProblemIdx={idx}
          />
        </div>

        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors duration-150 active:bg-indigo-400"
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
            <LanguageSelector
              value={session.language}
              onChange={(lang) => handleUpdateLanguage(sessionId, lang)}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={editorCode}
              language={session.language}
              onChange={(value) => {
                setEditorCode(value);
                editorCodeRef.current = value;
                handleTyping(value);
              }}
            />
          </div>

          <div
            onMouseDown={onMouseDownBottom}
            className="h-1 shrink-0 bg-gray-800 hover:bg-indigo-500 cursor-row-resize transition-colors duration-150 active:bg-indigo-400"
          />

          <div
            className="flex shrink-0 bg-gray-950"
            style={{ height: `${bottomHeight}px` }}
          >
            <div className="w-1/2 border-r border-gray-800 overflow-hidden">
              <AIQuestionPanel
                question={currentQuestion}
                onAnswer={handleAnswer}
                resetKey={questionResetKey}
                answer={currentAnswer}
                onAnswerChange={(val) => {
                  setCurrentAnswer(val);
                  currentAnswerRef.current = val;
                }}
              />
            </div>
            <div className="w-1/2 overflow-hidden">
              <OutputPanel code={editorCode} language={session.language} />
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          success={toast.success}
          error={!toast.success}
        />
      )}
      {(isGeneratingReport || showReport) && (
        <ReportOverlay
          report={session?.report}
          isLoading={isGeneratingReport}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}
