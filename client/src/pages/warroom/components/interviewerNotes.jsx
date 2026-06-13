import { useState, useEffect } from "react";
import { useRoom } from "../../../hooks/useRoom.jsx";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/spinner.jsx";
import Button from "../../../components/button.jsx";
export default function InterviewerNotes() {
  const [notes, setNotes] = useState("");
  const [sequenceLoading, setSequenceLoading] = useState(true); 
  const navigate = useNavigate();
  const { room, handleUpdateNotes } = useRoom();
  const report = room?.report ? JSON.parse(room.report) : null;

  useEffect(() => {
    if (report) setSequenceLoading(false);
  }, [room?.report]);

  async function handleFinish() {
    await handleUpdateNotes(room.roomId, notes);
    navigate("/warroom/all-rooms");
  }

  if (sequenceLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center gap-3">
        <Spinner />
        <p className="text-gray-400 font-mono text-sm">Generating report...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 overflow-y-auto p-8 font-mono">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* AI Score + Verdict */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold">Interview Report</h2>
          <span className="text-indigo-400 text-2xl font-bold">
            {report.score}/10
          </span>
        </div>

        <p className="text-gray-300 text-sm">{report.summary}</p>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-green-400 text-xs mb-2">Strengths</p>
            <ul className="text-gray-300 text-sm space-y-1">
              {report.strengths.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-red-400 text-xs mb-2">Weaknesses</p>
            <ul className="text-gray-300 text-sm space-y-1">
              {report.weaknesses.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-problem feedback */}
        {report.perProblemFeedback?.map((p, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          >
            <p className="text-indigo-300 text-sm font-semibold mb-1">
              {p.title}
            </p>
            <p className="text-gray-400 text-xs">Code: {p.codeQuality}</p>
            <p className="text-gray-400 text-xs">Time: {p.timeEfficiency}</p>
          </div>
        ))}

        {/* Hesitation + Progression */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-yellow-400 text-xs mb-1">Hesitation Analysis</p>
          <p className="text-gray-300 text-sm">{report.hesitationAnalysis}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-blue-400 text-xs mb-1">Code Progression</p>
          <p className="text-gray-300 text-sm">
            {report.codeProgressionAnalysis}
          </p>
        </div>

        {/* AI verdict banner */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-xs mb-1">AI Recommendation</p>
          <p
            className={`text-sm font-semibold ${
              report.verdict.includes("Hire") && !report.verdict.includes("No")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {report.verdict}
          </p>
          <p className="text-gray-300 text-xs mt-2">{report.feedback}</p>
        </div>

        {/* Interviewer notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your own notes..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-300 text-sm min-h-[100px] resize-none focus:outline-none focus:border-indigo-700"
        />

        {/* Final verdict buttons */}
        <div className="flex gap-3">
          <Button onClick={handleFinish}>Save & Finish</Button>
        </div>
      </div>
    </div>
  );
}
