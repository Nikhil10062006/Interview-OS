import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoom } from "../../hooks/useRoom.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import { useHeatMap } from "../../hooks/useHeatMap.jsx";
import { useSessionReplay } from "../../hooks/useSessionReplay.jsx";
import Toast from "../../components/toast.jsx";
import Spinner from "../../components/spinner.jsx";
import {
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Clock,
  Brain,
  Sparkles,
  Activity,
  FileCode2,
  TerminalSquare,
  FileText,
  RotateCcw,
  ArrowLeft,
  Timer,
  TestTube2,
  BookOpen,
  Zap,
} from "lucide-react";

export default function RoomSummary() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, toast } = useToast();
  const {
    room,
    loading,
    error,
    handleGetRoom,
    handleSummary,
    handleGenerateReport,
    handleGetRoomDetail,
  } = useRoom();

  const [expandedProblem, setExpandedProblem] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("replay");

  const { intensityMap } = useHeatMap(roomId, "room");
  const { snapshots, currentSnapshot, idx, isPlaying, play, pause, seek } =
    useSessionReplay(roomId, "room");

  useEffect(() => {
    handleGetRoomDetail (roomId);
  }, [roomId]);

  const isInterviewer =
    room &&
    user &&
    String(room.interviewer?._id || room.interviewer) === String(user._id);
  const isCandidate =
    room &&
    user &&
    String(room.candidate?._id || room.candidate) === String(user._id);

  const onGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await handleSummary(roomId);
      showToast("Technical analysis generated!", "success");
    } catch {
      showToast("Failed to generate analysis.", "error");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const onGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await handleGenerateReport(roomId);
      showToast("Report generated!", "success");
    } catch {
      showToast("Failed to generate report.", "error");
    } finally {
      setIsGeneratingReport(false);
    }
  };

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

  const parsedSummary = (() => {
    if (!room?.summary) return null;
    try {
      return JSON.parse(room.summary);
    } catch {
      return room.summary;
    }
  })();

  const parsedReport = (() => {
    if (!room?.report) return null;
    try {
      return JSON.parse(room.report);
    } catch {
      return room.report;
    }
  })();

  const formatDuration = (start, end) => {
    if (!end) return "Ongoing";
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const formatSeconds = (s) => {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTimestamp = (ts) =>
    new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const hesitationMeta = (kind) => {
    if (kind === "longPause")
      return {
        label: "Long Pause",
        dot: "bg-amber-400",
        pill: "text-amber-400 bg-amber-400/10 border-amber-400/25",
      };
    if (kind === "massDeletion")
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
  };

  if (loading && !room)
    return (
      <div className="flex items-center justify-center h-screen bg-[#07070a]">
        <Spinner />
      </div>
    );

  if (error || !room)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#07070a] text-white gap-4">
        <p className="text-red-400 font-mono text-sm">
          {error || "Room not found."}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-indigo-400 hover:text-indigo-300 font-mono text-xs border border-indigo-800/50 px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    );

  const interviewer = room.interviewer?.username || "Unknown";
  const candidate = room.candidate?.username || "Unknown";
  const isCandidateBlocked = room.isCandidateBlocked ?? false;
  const hesitations = room.hesitations || [];
  const hasProblems = room.problem && room.problem.length > 0;
  const interviewerNotes = room.notes || "";
  const isReplayAtEnd = snapshots?.length > 0 && idx >= snapshots.length - 1;

  const verdictColor = (v = "") => {
    const lower = v.toLowerCase();
    if (lower.includes("strong hire"))
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/30";
    if (lower.includes("no hire"))
      return "text-rose-300 bg-rose-400/10 border-rose-400/30";
    if (lower.includes("hire"))
      return "text-sky-300 bg-sky-400/10 border-sky-400/30";
    return "text-gray-300 bg-white/5 border-white/10";
  };

  const scoreColor = (n) => {
    if (n >= 8) return "text-emerald-300";
    if (n >= 5) return "text-amber-300";
    return "text-rose-300";
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans">
      {/* ─── ambient glow ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/8 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-5 py-8 pb-24 space-y-7">
        <Toast toast={toast} />

        {/* ─── HEADER ─── */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/warroom/all-rooms")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 font-mono text-[11px] transition-colors w-fit group"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            ALL ROOMS
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Interview Summary
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                  ENDED
                </span>
                {isCandidateBlocked && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 tracking-wider">
                    ⚠ TERMINATED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                {formatDate(room.createdAt)}
                <span className="mx-2 text-gray-700">·</span>
                <span className="text-gray-600">ID: {room.roomId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ─── STAT STRIP ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Shield,
              label: "Interviewer",
              value: interviewer,
              accent: "indigo",
            },
            {
              icon: User,
              label: "Candidate",
              value: candidate,
              accent: "emerald",
            },
            {
              icon: Clock,
              label: "Duration",
              value: formatDuration(room.createdAt, room.endedAt),
              accent: "amber",
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

        {/* ─── AI REPORTS: SIDE BY SIDE ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Interviewer Report */}
          <div
            className="rounded-xl border border-white/7 bg-white/[0.025] overflow-hidden flex flex-col"
            style={{ minHeight: 380 }}
          >
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-transparent">
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-[0.15em] flex items-center gap-2">
                <Brain size={13} /> Interviewer Report
              </span>
              {hasProblems && !parsedReport && isInterviewer && (
                <button
                  onClick={onGenerateReport}
                  disabled={loading}
                  className="text-[10px] font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md transition-colors disabled:opacity-40"
                >
                  Generate
                </button>
              )}
              {hasProblems && parsedReport && isCandidate && (
                <button
                  onClick={onGenerateReport}
                  disabled={loading}
                  className="text-[10px] font-mono bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-md transition-colors disabled:opacity-40"
                >
                  Regenerate
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {!hasProblems ? (
                <EmptySlate label="No problems assigned." />
              ) : isGeneratingReport ? (
                <LoadingSlate label="Analyzing performance…" color="indigo" />
              ) : parsedReport ? (
                <>
                  {parsedReport.verdict && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        Verdict
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border tracking-wider ${verdictColor(parsedReport.verdict)}`}
                      >
                        {parsedReport.verdict.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {parsedReport.feedback && (
                    <InfoBlock label="Feedback" text={parsedReport.feedback} />
                  )}
                  {parsedReport.hesitationAnalysis && (
                    <InfoBlock
                      label="Struggle Points"
                      text={parsedReport.hesitationAnalysis}
                      accent="amber"
                    />
                  )}
                  {parsedReport.codeProgressionAnalysis && (
                    <InfoBlock
                      label="Code Progression"
                      text={parsedReport.codeProgressionAnalysis}
                    />
                  )}
                </>
              ) : (
                <EmptySlate label="Report pending generation." />
              )}
            </div>
          </div>

          {/* Technical Analysis */}
          <div
            className="rounded-xl border border-white/7 bg-white/[0.025] overflow-hidden flex flex-col"
            style={{ minHeight: 380 }}
          >
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 to-transparent">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Sparkles size={13} /> Technical Analysis
              </span>
              {hasProblems && !parsedSummary && isInterviewer && (
                <button
                  onClick={onGenerateSummary}
                  disabled={loading}
                  className="text-[10px] font-mono bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-md transition-colors disabled:opacity-40"
                >
                  Generate
                </button>
              )}
              {hasProblems && parsedSummary && isCandidate && (
                <button
                  onClick={onGenerateSummary}
                  disabled={loading}
                  className="text-[10px] font-mono bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-md transition-colors disabled:opacity-40"
                >
                  Regenerate
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {!hasProblems ? (
                <EmptySlate label="No problems assigned." />
              ) : isGeneratingSummary ? (
                <LoadingSlate label="Evaluating code…" color="emerald" />
              ) : parsedSummary ? (
                <>
                  {parsedSummary.score !== undefined && (
                    <div className="flex items-end justify-between bg-black/20 rounded-lg px-4 py-3 border border-white/5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        Tech Score
                      </span>
                      <span
                        className={`text-3xl font-bold leading-none ${scoreColor(parsedSummary.score)}`}
                      >
                        {parsedSummary.score}
                        <span className="text-sm text-gray-600 font-normal">
                          /10
                        </span>
                      </span>
                    </div>
                  )}
                  {parsedSummary.summary && (
                    <InfoBlock label="Overview" text={parsedSummary.summary} />
                  )}
                  {parsedSummary.strengths?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest mb-2">
                        Strengths
                      </p>
                      <ul className="space-y-1.5">
                        {parsedSummary.strengths.map((s, i) => (
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
                  {parsedSummary.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-rose-500 uppercase tracking-widest mb-2">
                        Areas to Improve
                      </p>
                      <ul className="space-y-1.5">
                        {parsedSummary.weaknesses.map((w, i) => (
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
                </>
              ) : (
                <EmptySlate label="Analysis pending generation." />
              )}
            </div>
          </div>
        </div>

        {/* ─── TABBED SECTION ─── */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 overflow-x-auto">
            {[
              { id: "replay", icon: TerminalSquare, label: "Session Replay" },
              {
                id: "problems",
                icon: FileCode2,
                label: `Problems (${room.problem?.length || 0})`,
              },
              {
                id: "logs",
                icon: Activity,
                label: `Telemetry (${hesitations.length})`,
              },
              {
                id: "notes",
                icon: FileText,
                label: "Notes",
                hide: !interviewerNotes,
              },
            ].map(
              (tab) =>
                !tab.hide && (
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
                ),
            )}
          </div>

          {/* ── TAB: REPLAY ── */}
          {activeTab === "replay" && (
            <div className="flex flex-col">
              {snapshots?.length === 0 ? (
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
                room.problem.map((prob, index) => {
                  const isOpen = expandedProblem === index;
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
                              {prob.title || `Problem ${index + 1}`}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                              <Timer size={10} className="inline" />
                              {formatSeconds(prob.duration)}
                              {prob.testCases?.length > 0 && (
                                <>
                                  <span className="text-gray-700">·</span>
                                  <TestTube2 size={10} className="inline" />
                                  {prob.testCases.length} test case
                                  {prob.testCases.length !== 1 ? "s" : ""}
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
                          {/* Description */}
                          {prob.description && (
                            <div>
                              <SectionLabel
                                icon={BookOpen}
                                label="Description"
                              />
                              <p className="text-xs text-gray-300 leading-relaxed mt-2">
                                {prob.description}
                              </p>
                            </div>
                          )}

                          {/* Examples + Constraints side by side if both exist */}
                          {(prob.examples || prob.constraints) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {prob.examples && (
                                <div>
                                  <SectionLabel label="Examples" />
                                  <pre className="mt-2 text-[11px] text-gray-400 font-mono bg-black/30 border border-white/5 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                                    {prob.examples}
                                  </pre>
                                </div>
                              )}
                              {prob.constraints && (
                                <div>
                                  <SectionLabel label="Constraints" />
                                  <pre className="mt-2 text-[11px] text-gray-400 font-mono bg-black/30 border border-white/5 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                                    {prob.constraints}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Time spent */}
                          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5 w-fit">
                            <Timer size={13} className="text-indigo-400" />
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                              Time Spent
                            </span>
                            <span className="text-xs font-mono text-white ml-1">
                              {formatSeconds(prob.duration)}
                            </span>
                          </div>

                          {/* Test Cases */}
                          {prob.testCases?.length > 0 && (
                            <div>
                              <SectionLabel
                                icon={TestTube2}
                                label={`Test Cases (${prob.testCases.length})`}
                              />
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {prob.testCases.map((tc, tcIdx) => (
                                  <div
                                    key={tcIdx}
                                    className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-mono text-gray-500">
                                        {tc.label || `Case ${tcIdx + 1}`}
                                      </span>
                                      <span
                                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                          tc.addedBy === "candidate"
                                            ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                                            : "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                                        }`}
                                      >
                                        {tc.addedBy}
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <div>
                                        <span className="text-[9px] font-mono text-gray-600 uppercase">
                                          Input
                                        </span>
                                        <p className="text-[11px] font-mono text-gray-300 bg-black/20 rounded px-2 py-1 mt-0.5 whitespace-pre-wrap">
                                          {tc.input || "—"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-mono text-gray-600 uppercase">
                                          Expected
                                        </span>
                                        <p className="text-[11px] font-mono text-emerald-300 bg-emerald-900/10 rounded px-2 py-1 mt-0.5 whitespace-pre-wrap">
                                          {tc.expectedOutput || "—"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
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
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB: LOGS ── */}
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
                          {h.kind !== "massDeletion" && h.duration > 0 && (
                            <span className="text-gray-400">{h.duration}s</span>
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

          {/* ── TAB: NOTES ── */}
          {activeTab === "notes" && (
            <div className="p-5">
              <div className="bg-amber-900/8 border border-amber-500/15 rounded-xl p-5 max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <p className="text-xs text-amber-100/70 leading-relaxed whitespace-pre-wrap font-mono">
                  {interviewerNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── small shared sub-components (pure UI, no logic) ─── */

function EmptySlate({ label }) {
  return (
    <div className="h-full min-h-[120px] flex items-center justify-center text-center p-8 border border-dashed border-white/[0.06] rounded-xl text-[11px] text-gray-600 font-mono">
      {label}
    </div>
  );
}

function LoadingSlate({ label, color = "indigo" }) {
  return (
    <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-3">
      <Spinner />
    </div>
  );
}

function InfoBlock({ label, text, accent }) {
  return (
    <div>
      <p
        className={`text-[9px] font-mono uppercase tracking-widest mb-1.5 ${accent === "amber" ? "text-amber-500" : "text-gray-500"}`}
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
