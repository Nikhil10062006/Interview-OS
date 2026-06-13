import { useRoom } from "../../../hooks/useRoom.jsx";
import Card from "../../../components/card.jsx";
import Badge from "../../../components/badge.jsx";

function OnlineDot({ isOnline }) {
  return (
    <div
      className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-600"}`}
    />
  );
}

function ParticipantCard({ user, role, isOnline, placeholder }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Badge>{role}</Badge>
        <OnlineDot isOnline={isOnline} />
      </div>
      {user ? (
        <div className="flex items-center gap-3 mt-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-mono font-bold">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-200 font-mono">{user.username}</p>
            <p className="text-xs text-gray-500">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-600 text-xs">?</span>
          </div>
          <p className="text-xs text-gray-500 animate-pulse">{placeholder}</p>
        </div>
      )}
    </Card>
  );
}

export default function ParticipantPanel({ onlineParticipants, candidate }) {
  const { room } = useRoom();

  if (!room) return null;

  const isInterviewerOnline = onlineParticipants
    .map(String)
    .includes(String(room.interviewer?._id ?? room.interviewer ?? ""));

  const isCandidateOnline = onlineParticipants
    .map(String)
    .includes(String(candidate?._id ?? "")); // use prop

  return (
    <div className="flex flex-col shrink-0 border-b border-gray-800">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
          Participants
        </p>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <ParticipantCard
          user={room.interviewer}
          role="Interviewer"
          isOnline={isInterviewerOnline}
        />
        <ParticipantCard
          user={candidate} // use prop
          role="Candidate"
          isOnline={isCandidateOnline}
          placeholder="Waiting for candidate..."
        />
      </div>
    </div>
  );
}
