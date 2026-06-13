import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Activity,
  FileCode2,
  TerminalSquare,
  FileText,
  Clock,
  BookOpen,
  TestTube2,
  Timer,
  Zap,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
} from "lucide-react";
import { useMockRoom } from "../../hooks/useMock.jsx";
import { useHeatMap } from "../../hooks/useHeatMap.jsx";
import { useSessionReplay } from "../../hooks/useSessionReplay.jsx";
import Button from "../../components/button.jsx";
import Spinner from "../../components/spinner.jsx";

// ─── verdict styling ───
const verdictConfig = {
  "Strong Hire": {
    color: "text-emerald-300",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
  Hire: {
    color: "text-sky-300",
    bg: "bg-sky-400/10 border-sky-400/30",
  },
  "No Hire": {
    color: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  "Strong No Hire": {
    color: "text-rose-300",
    bg: "bg-rose-400/10 border-rose-400/30",
  },
};

function parseReport(report) {
  if (!report) return null;
  if (typeof report === "string") {
    try {
      return JSON.parse(report);
    } catch {
      return null;
    }
  }
  return report;
}

// problem.question is stored as a JSON string
function parseProblemQuestion(question) {
  if (!question) return {};
  try {
    return JSON.parse(question);
  } catch {
    return { statement: question };
  }
}

function hesitationMeta(kind) {
  if (kind === "longPause")
    return {
      label: "Long Pause",
      dot: "bg-amber-400",
      pill: "text-amber-400 bg-amber-400/10 border-amber-400/25",
    };
  if (kind === "massDeletion")
    // was "deletion" — must match schema enum
    return {
      label: "Mass Delete",
      dot: "bg-rose-400",
      pill: "text-rose-400 bg-rose-400/10 border-rose-400/25",
    };
  return {
    label: "Idle",
    dot: "bg-gray-500",
    pill: "text-gray-400 bg-white/5 border-white/10",
  };
}

function formatSeconds(s) {
  if (!s || s === 0) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start, end) {
  if (!end) return "Ongoing";
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── sub-components ───
function EmptySlate({ label }) {
  return (
    <div className="min-h-[120px] flex items-center justify-center border border-dashed border-white/[0.06] rounded-xl text-[11px] text-gray-600 font-mono p-8 text-center">
      {label}
    </div>
  );
}

function LoadingSlate({ label, color = "indigo" }) {
  return (
    <div className="min-h-[120px] flex flex-col items-center justify-center gap-3">
      <Spinner />
      <p className={`text-[10px] font-mono text-${color}-400 animate-pulse`}>
        {label}
      </p>
    </div>
  );
}

function InfoBlock({ label, text, accent }) {
  return (
    <div>
      <p
        className={`text-[9px] font-mono uppercase tracking-widest mb-1.5 ${
          accent === "amber" ? "text-amber-500" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={12} className="text-gray-600" />}
      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}

// ─── main component ───
export default function SessionSummary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, loading, error, handleGetSession, handleGenerateReport } =
    useMockRoom();

  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState(false);
  const [activeTab, setActiveTab] = useState("replay");
  const [expandedProblem, setExpandedProblem] = useState(null);

  const reportRequestedRef = useRef(false);

  const { intensityMap } = useHeatMap(sessionId, "mock");
  const { snapshots, currentSnapshot, idx, isPlaying, play, pause, seek } =
    useSessionReplay(sessionId, "mock");

  // step 1: load session
  useEffect(() => {
    if (session?.sessionId !== sessionId) {
      handleGetSession(sessionId);
    }
  }, [sessionId]);

  // step 2: ensure report exists
  useEffect(() => {
    if (session?.sessionId !== sessionId) return;

    if (session.report) {
      setReportLoading(false);
      return;
    }

    if (reportRequestedRef.current) return;
    reportRequestedRef.current = true;

    setReportError(false);

    (async () => {
      try {
        await handleGenerateReport(sessionId);
      } catch {
        setReportError(true);
      } finally {
        setReportLoading(false);
      }
    })();
  }, [session, sessionId]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      if (snapshots?.length > 0 && idx >= snapshots.length - 1) {
        seek(0);
        setTimeout(play, 100);
      } else {
        play();
      }
    }
  };

  const handleSliderChange = (e) => {
    pause();
    seek(Number(e.target.value));
  };

  // ─── loading state ───
  if (session?.sessionId !== sessionId || reportLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-gray-400 font-mono text-sm">
          Loading your report...
        </p>
      </div>
    );
  }

  // ─── error state ───
  if (!session || reportError || error) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-gray-400 font-mono text-sm">
          Couldn't load this session.
        </p>
        <Button onClick={() => navigate("/phantom/all-sessions")}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  const report = parseReport(session.report);
  const hesitations = session.hesitations || [];
  const hasProblems = session.problem && session.problem.length > 0;
  const isReplayAtEnd = snapshots?.length > 0 && idx >= snapshots.length - 1;

  const verdict = report
    ? verdictConfig[report.verdict] || verdictConfig["No Hire"]
    : null;

  const scoreColor = (n) => {
    if (n >= 8) return "text-emerald-300";
    if (n >= 5) return "text-amber-300";
    return "text-rose-300";
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans">
      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/8 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-5 py-8 pb-24 space-y-7">
        {/* ─── HEADER ─── */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/phantom/all-sessions")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 font-mono text-[11px] transition-colors w-fit group"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            ALL SESSIONS
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Session Report
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                  ENDED
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                {formatDate(session.createdAt)}
                <span className="mx-2 text-gray-700">·</span>
                <span className="text-gray-600">ID: {sessionId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ─── STAT STRIP ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: Clock,
              label: "Duration",
              value: formatDuration(session.createdAt, session.endedAt),
              accent: "amber",
            },
            {
              icon: User,
              label: "Experience",
              value: session.experienceLevel || "—",
              accent: "indigo",
            },
            {
              icon: Zap,
              label: "Language",
              value: session.language || "—",
              accent: "emerald",
            },
            {
              icon: Brain,
              label: "Difficulty",
              value: session.targetDifficulty || "—",
              accent: "violet",
            },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-white/10 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-${accent}-500/10 shrink-0`}>
                <Icon size={15} className={`text-${accent}-400`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  {label}
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── REPORT CARD ─── */}
        {report ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Score + Verdict */}
            <div className="rounded-xl border border-white/7 bg-white/[0.025] overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-indigo-950/40 to-transparent">
                <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Brain size={13} /> Performance Report
                </span>
              </div>
              <div className="p-5 space-y-4 flex-1">
                {/* Score */}
                <div className="flex items-end justify-between bg-black/20 rounded-lg px-4 py-3 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    Score
                  </span>
                  <span
                    className={`text-3xl font-bold leading-none ${scoreColor(report.score)}`}
                  >
                    {report.score}
                    <span className="text-sm text-gray-600 font-normal">
                      /10
                    </span>
                  </span>
                </div>

                {/* Verdict */}
                {verdict && (
                  <div className={`rounded-lg border px-4 py-3 ${verdict.bg}`}>
                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                      Verdict
                    </p>
                    <p
                      className={`text-base font-bold font-mono tracking-wider ${verdict.color}`}
                    >
                      {report.verdict.toUpperCase()}
                    </p>
                  </div>
                )}

                {report.summary && (
                  <InfoBlock label="Summary" text={report.summary} />
                )}
              </div>
            </div>

            {/* Strengths + Weaknesses */}
            <div className="rounded-xl border border-white/7 bg-white/[0.025] overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-emerald-950/30 to-transparent">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Sparkles size={13} /> Skill Breakdown
                </span>
              </div>
              <div className="p-5 space-y-4 flex-1">
                {report.strengths?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest mb-2">
                      Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {report.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-300"
                        >
                          <span className="text-emerald-500 mt-0.5 shrink-0">
                            +
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.weaknesses?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-mono text-rose-500 uppercase tracking-widest mb-2">
                      Areas to Improve
                    </p>
                    <ul className="space-y-1.5">
                      {report.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-300"
                        >
                          <span className="text-rose-500 mt-0.5 shrink-0">
                            −
                          </span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.hesitationAnalysis && (
                  <InfoBlock
                    label="Hesitation Analysis"
                    text={report.hesitationAnalysis}
                    accent="amber"
                  />
                )}
                {report.communicationAnalysis && (
                  <InfoBlock
                    label="Communication"
                    text={report.communicationAnalysis}
                  />
                )}
                {report.feedback && (
                  <InfoBlock label="Feedback" text={report.feedback} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptySlate label="Report could not be generated for this session." />
        )}

        {/* ─── TABBED SECTION ─── */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 overflow-x-auto">
            {[
              { id: "replay", icon: TerminalSquare, label: "Session Replay" },
              {
                id: "problems",
                icon: FileCode2,
                label: `Problems (${session.problem?.length || 0})`,
              },
              {
                id: "logs",
                icon: Activity,
                label: `Telemetry (${hesitations.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-mono tracking-wide whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.015]"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: REPLAY ── */}
          {activeTab === "replay" && (
            <div className="flex flex-col">
              {!snapshots || snapshots.length === 0 ? (
                <div className="p-16 text-center text-gray-600 font-mono text-xs">
                  No code progression recorded for this session.
                </div>
              ) : (
                <>
                  <div className="h-[420px] overflow-y-auto bg-[#08080b] p-4 font-mono text-xs text-gray-300 leading-loose [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {currentSnapshot?.code ? (
                      currentSnapshot.code.split("\n").map((line, i) => {
                        const lineNum = i + 1;
                        const intensity = intensityMap?.get(lineNum);
                        let lineClass =
                          "border-l-2 border-transparent hover:bg-white/[0.015]";
                        if (intensity === "high")
                          lineClass =
                            "bg-rose-500/15 border-l-2 border-rose-500/70 text-rose-100";
                        else if (intensity === "medium")
                          lineClass =
                            "bg-amber-500/10 border-l-2 border-amber-500/60 text-amber-100";
                        else if (intensity === "low")
                          lineClass =
                            "bg-yellow-500/8 border-l-2 border-yellow-500/40 text-yellow-100";
                        return (
                          <div key={lineNum} className={`flex ${lineClass}`}>
                            <span className="text-gray-700 select-none w-10 text-right pr-4 border-r border-white/[0.04] shrink-0">
                              {lineNum}
                            </span>
                            <span className="whitespace-pre pl-4 break-all">
                              {line || " "}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-700">Waiting for code…</p>
                    )}
                  </div>

                  {/* Playback controls */}
                  <div className="border-t border-white/5 bg-[#0d0d11] px-5 py-4 flex items-center gap-4">
                    <button
                      onClick={handlePlayToggle}
                      className="w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors shrink-0 shadow-lg shadow-indigo-600/20"
                    >
                      {isPlaying ? (
                        <Pause size={15} fill="currentColor" />
                      ) : isReplayAtEnd ? (
                        <RotateCcw size={14} />
                      ) : (
                        <Play
                          size={15}
                          fill="currentColor"
                          className="ml-0.5"
                        />
                      )}
                    </button>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, snapshots.length - 1)}
                        value={idx}
                        onChange={handleSliderChange}
                        className="w-full accent-indigo-500 cursor-pointer h-1 bg-black rounded-full appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                        <span>START</span>
                        <span className="text-indigo-400">
                          {currentSnapshot?.timestamp
                            ? formatTimestamp(currentSnapshot.timestamp)
                            : "--:--:--"}
                        </span>
                        <span>END</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB: PROBLEMS ── */}
          {activeTab === "problems" && (
            <div className="p-5 space-y-3">
              {!hasProblems ? (
                <EmptySlate label="No problems were assigned in this session." />
              ) : (
                session.problem.map((prob, index) => {
                  const isOpen = expandedProblem === index;
                  const parsed = parseProblemQuestion(prob.question);
                  return (
                    <div
                      key={prob._id || index}
                      className="border border-white/5 rounded-xl overflow-hidden bg-black/20 hover:border-white/8 transition-colors"
                    >
                      {/* Accordion header */}
                      <button
                        onClick={() =>
                          setExpandedProblem(isOpen ? null : index)
                        }
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.025] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/15 text-[10px] font-mono text-indigo-400 font-bold shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm text-white font-medium leading-tight">
                              {parsed.title || `Problem ${index + 1}`}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                              <span
                                className={`${
                                  prob.difficulty === "Easy"
                                    ? "text-emerald-400"
                                    : prob.difficulty === "Hard"
                                      ? "text-rose-400"
                                      : "text-amber-400"
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                              {prob.topic?.length > 0 && (
                                <>
                                  <span className="text-gray-700">·</span>
                                  {prob.topic.join(", ")}
                                </>
                              )}
                              {prob.duration > 0 && (
                                <>
                                  <span className="text-gray-700">·</span>
                                  <Timer size={10} className="inline" />
                                  {formatSeconds(prob.duration)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {prob.finalCode && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              CODE SUBMITTED
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronUp
                              size={15}
                              className="text-gray-500 shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={15}
                              className="text-gray-500 shrink-0"
                            />
                          )}
                        </div>
                      </button>

                      {/* Expanded body */}
                      {isOpen && (
                        <div className="border-t border-white/5 bg-[#08080b] p-5 space-y-5">
                          {/* Problem statement */}
                          {parsed.statement && (
                            <div>
                              <SectionLabel
                                icon={BookOpen}
                                label="Problem Statement"
                              />
                              <p className="text-xs text-gray-300 leading-relaxed mt-2">
                                {parsed.statement}
                              </p>
                            </div>
                          )}

                          {/* Examples + Constraints */}
                          {(parsed.examples || parsed.constraints) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {parsed.examples && (
                                <div>
                                  <SectionLabel label="Examples" />
                                  <pre className="mt-2 text-[11px] text-gray-400 font-mono bg-black/30 border border-white/5 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                                    {parsed.examples}
                                  </pre>
                                </div>
                              )}
                              {parsed.constraints && (
                                <div>
                                  <SectionLabel label="Constraints" />
                                  <pre className="mt-2 text-[11px] text-gray-400 font-mono bg-black/30 border border-white/5 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                                    {parsed.constraints}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Q&A from the mock session */}
                          {prob.quesAndAns?.length > 0 && (
                            <div>
                              <SectionLabel
                                icon={MessageSquare}
                                label={`AI Probing Q&A (${prob.quesAndAns.length})`}
                              />
                              <div className="mt-2 space-y-3">
                                {prob.quesAndAns.map((qa, qaIdx) => (
                                  <div
                                    key={qaIdx}
                                    className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2"
                                  >
                                    <p className="text-[10px] font-mono text-indigo-400">
                                      Q: {qa.question}
                                    </p>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      A:{" "}
                                      {qa.answer || (
                                        <span className="text-gray-600 italic">
                                          No answer recorded
                                        </span>
                                      )}
                                    </p>
                                    {qa.answerDuration > 0 && (
                                      <p className="text-[9px] font-mono text-gray-600">
                                        Response time:{" "}
                                        {formatSeconds(qa.answerDuration)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Time spent */}
                          {prob.duration > 0 && (
                            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5 w-fit">
                              <Timer size={13} className="text-indigo-400" />
                              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                Time Spent
                              </span>
                              <span className="text-xs font-mono text-white ml-1">
                                {formatSeconds(prob.duration)}
                              </span>
                            </div>
                          )}

                          {/* Final Code */}
                          <div>
                            <SectionLabel
                              icon={FileCode2}
                              label="Final Submitted Code"
                            />
                            {prob.finalCode ? (
                              <pre className="mt-2 bg-black/40 border border-white/5 rounded-lg p-4 text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {prob.finalCode}
                              </pre>
                            ) : (
                              <p className="mt-2 text-xs text-gray-600 font-mono italic">
                                No code was submitted for this problem.
                              </p>
                            )}
                          </div>

                          {/* Reference Solution */}
                          {prob.referenceSolution && (
                            <div>
                              <SectionLabel label="Reference Solution" />
                              <pre className="mt-2 bg-black/40 border border-indigo-500/10 rounded-lg p-4 text-[11px] text-indigo-300 font-mono overflow-x-auto leading-relaxed [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {prob.referenceSolution}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB: TELEMETRY ── */}
          {activeTab === "logs" && (
            <div className="p-5">
              {hesitations.length === 0 ? (
                <EmptySlate label="No hesitation events detected in this session." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {hesitations.map((h, i) => {
                    const { label, dot, pill } = hesitationMeta(h.kind);
                    return (
                      <div
                        key={h._id || i}
                        className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 flex items-center justify-between hover:border-white/8 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}
                          />
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border ${pill} tracking-wider`}
                          >
                            {label.toUpperCase()}
                          </span>
                          {h.lineNumber > 0 && (
                            <span className="text-[10px] text-gray-500 font-mono">
                              Ln {h.lineNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-600">
                          {h.kind !== "massDeletion" &&
                            h.duration > 0 && ( // was "deletion"
                              <span className="text-gray-400">
                                {h.duration}s
                              </span>
                            )}
                          <span>{formatTimestamp(h.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}