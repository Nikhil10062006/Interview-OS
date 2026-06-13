import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Badge from "../../../components/badge.jsx";

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

const RoomCard = ({ room, currentUserId }) => {
  const navigate = useNavigate();

  const interviewer = room.interviewer?.username || "Unknown";
  const candidateName = room.candidate?.username || "Unknown";
  const problemCount = room.problem?.length || 0;
  const isCurrentUserInterviewer =
    String(room.interviewer?._id ?? room.interviewer) === String(currentUserId);

  function handleOpen() {
    if (room.status === "ended") {
      navigate(`/warroom/${room.roomId}/detail`);
    } else {
      navigate(`/warroom/${room.roomId}`);
    }
  }

  return (
    <div
      onClick={handleOpen}
      className="flex items-center justify-between border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 bg-gray-900/50 cursor-pointer transition-colors group"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm text-white tracking-widest">
          {room.roomId}
        </span>
        <span className="text-xs text-gray-500">
          {isCurrentUserInterviewer ? "Interviewer" : "Candidate"}
          {" · "}
          {interviewer} vs {candidateName}
          {" · "}
          {formatDate(room.createdAt)}
          {" · "}
          {problemCount} problem{problemCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={statusBadgeVariant(room.status)}>
          {room.status === "ended"
            ? "Ended"
            : room.status === "active"
              ? "In Progress"
              : "Waiting"}
        </Badge>
        <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
      </div>
    </div>
  );
};

export default RoomCard;
