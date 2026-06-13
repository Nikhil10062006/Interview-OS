import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMockRoom } from "../../hooks/useMock.jsx";
import Spinner from "../../components/spinner.jsx";
import Badge from "../../components/badge.jsx";

function statusBadgeVariant(status) {
  if (status === "active") return "success";
  if (status === "waiting") return "warning";
  return "default";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AllSessions() {
  const navigate = useNavigate();
  const { sessions, loading, error, handleGetAllSessions } = useMockRoom();

  useEffect(() => {
    handleGetAllSessions();
  }, []);

  function handleOpen(session) {
    if (session.status === "ended") {
      navigate(`/phantom/${session.sessionId}/summary`);
    } else {
      navigate(`/phantom/${session.sessionId}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <button
          onClick={() => navigate("/phantom")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </button>

        <h1 className="text-3xl font-bold">All Mock Sessions</h1>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm">Could not load sessions.</p>
        )}

        {!loading && !error && (sessions?.length ?? 0) === 0 && (
          <p className="text-gray-500 text-sm">
            No sessions yet. Start one from the Phantom AI lobby.
          </p>
        )}

        <div className="space-y-2">
          {(sessions || []).map((s) => (
            <div
              key={s.sessionId}
              onClick={() => handleOpen(s)}
              className="flex items-center justify-between border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 bg-gray-900/50 cursor-pointer transition-colors group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm text-white tracking-widest">
                  {s.sessionId}
                </span>
                <span className="text-xs text-gray-500">
                  {s.language} · {formatDate(s.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {s.status === "ended" && (
                  <span className="text-xs text-gray-400">
                    Score: {s.score ?? "—"}/10
                  </span>
                )}
                <Badge variant={statusBadgeVariant(s.status)}>
                  {s.status === "ended"
                    ? "Ended"
                    : s.status === "active"
                      ? "In Progress"
                      : "Waiting"}
                </Badge>
                <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}