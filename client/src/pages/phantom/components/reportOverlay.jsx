import { useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Button from "../../../components/button.jsx";
import Spinner from "../../../components/spinner.jsx"; 

const verdictConfig = {
  "Strong Hire": {
    color: "text-green-400",
    bg: "bg-green-950/40 border-green-800",
  },
  Hire: { color: "text-blue-400", bg: "bg-blue-950/40 border-blue-800" },
  "No Hire": {
    color: "text-yellow-400",
    bg: "bg-yellow-950/40 border-yellow-800",
  },
  "Strong No Hire": {
    color: "text-red-400",
    bg: "bg-red-950/40 border-red-800",
  },
};

export default function ReportOverlay({ report, isLoading, sessionId }) {
  const navigate = useNavigate();

  if (isLoading || !report) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950/90 flex flex-col items-center justify-center gap-4">
        <Spinner /> 
        <p className="text-gray-400 font-mono text-sm">
          Phantom AI is generating your report...
        </p>
      </div>
    );
  }

  const verdict = verdictConfig[report.verdict] || verdictConfig["No Hire"];
  const scoreColor =
    report.score >= 7
      ? "text-green-400"
      : report.score >= 4
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
            Session Complete
          </p>
          <h1 className="text-2xl font-bold text-white font-mono">
            Performance Report
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            Session: {sessionId}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className={`text-5xl font-bold font-mono ${scoreColor}`}>
              {report.score}
            </span>
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">
              / 10
            </span>
          </div>
          <div className={`flex-1 rounded-lg border px-4 py-3 ${verdict.bg}`}>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">
              Verdict
            </p>
            <p className={`text-lg font-bold font-mono ${verdict.color}`}>
              {report.verdict}
            </p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
            Summary
          </p>
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            {report.summary}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-green-400 font-mono uppercase tracking-widest">
                Strengths
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {report.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-300 font-mono leading-relaxed"
                >
                  • {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-400 font-mono uppercase tracking-widest">
                Weaknesses
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {report.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-300 font-mono leading-relaxed"
                >
                  • {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-yellow-400 font-mono uppercase tracking-widest">
              Hesitation Analysis
            </p>
          </div>
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            {report.hesitationAnalysis}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-blue-400 font-mono uppercase tracking-widest">
              Communication
            </p>
          </div>
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            {report.communicationAnalysis}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
            Feedback
          </p>
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            {report.feedback}
          </p>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => navigate("/phantom/all-sessions")}>
            View All Sessions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
