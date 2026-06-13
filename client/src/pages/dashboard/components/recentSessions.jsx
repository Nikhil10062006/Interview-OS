import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMockRoom } from "../../../hooks/useMock.jsx";
import { useRoom } from "../../../hooks/useRoom.jsx";
import Spinner from "../../../components/spinner.jsx";
import Badge from "../../../components/badge.jsx";
import Button from "../../../components/button.jsx";
import Toast from "../../../components/toast.jsx";
import { useToast } from "../../../hooks/useToast.jsx";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCreatedAt(room) {
  if (room.createdAt) return room.createdAt;
  try {
    const id = room._id || room.roomId;
    return new Date(parseInt(String(id).substring(0, 8), 16) * 1000);
  } catch {
    return null;
  }
}

function EmptyState({ emoji, message, buttonLabel, route, navigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <span className="text-4xl">{emoji}</span>
      <p className="text-gray-400 text-sm text-center">{message}</p>
      <Button
        onClick={() => navigate(route)}
        className="mt-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors duration-150"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

function SectionHeader({ title, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <button
        onClick={onViewAll}
        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
      >
        View all →
      </button>
    </div>
  );
}

export default function RecentSessions() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    handleGetAllSessions,
  } = useMockRoom();

  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    handleGetAllRooms,
    handleGetRoom,
  } = useRoom();

  useEffect(() => {
    handleGetAllSessions();
    handleGetAllRooms();
  }, []);

  const recentSessions = sessions?.slice(0, 5) ?? [];
  const recentRooms = rooms?.slice(0, 5) ?? [];

  function handleResumeSession(sessionId) {
    navigate(`/phantom/${sessionId}`);
  }

  async function handleRejoin(roomId) {
    try {
      await handleGetRoom(roomId);
      navigate(`/warroom/${roomId}`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        showToast("You have been removed from this room.", false);
        return;
      }
      showToast("Failed to join room.", false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <SectionHeader
            title="👻 Recent Mock Sessions"
            onViewAll={() => navigate("/phantom/all-sessions")}
          />
          {sessionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : sessionsError ? (
            <p className="text-red-400 text-sm">
              Could not load sessions. Try again later.
            </p>
          ) : recentSessions.length === 0 ? (
            <EmptyState
              emoji="👻"
              message="No mock sessions yet. Start your first Phantom AI interview."
              buttonLabel="Start Session"
              route="/phantom"
              navigate={navigate}
            />
          ) : (
            <div className="flex flex-col divide-y divide-gray-800">
              {recentSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between py-4 gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {formatDate(session.createdAt)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.language ?? "—"}
                    </span>
                  </div>
                  <Badge
                    label={
                      session.status === "ended"
                        ? "Ended"
                        : session.status === "active"
                          ? "Active"
                          : "Waiting"
                    }
                    className={
                      session.status === "active"
                        ? "bg-emerald-900 text-emerald-400 border border-emerald-700"
                        : session.status === "waiting"
                          ? "bg-yellow-900 text-yellow-400 border border-yellow-700"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                    }
                  />
                  <div className="flex-shrink-0">
                    {session.status !== "ended" ? (
                      <button
                        onClick={() => handleResumeSession(session.sessionId)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-500 px-3 py-1.5 rounded-lg transition-all duration-150"
                      >
                        Resume
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 px-3 py-1.5">
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <SectionHeader
            title="⚔️ Recent War Rooms"
            onViewAll={() => navigate("/warroom/all-rooms")}
          />
          {roomsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : roomsError && recentRooms.length === 0 ? (
            <p className="text-red-400 text-sm">
              Could not load rooms. Try again later.
            </p>
          ) : recentRooms.length === 0 ? (
            <EmptyState
              emoji="⚔️"
              message="No war rooms yet. Challenge a developer to a 1v1 coding room."
              buttonLabel="Enter Lobby"
              route="/warroom"
              navigate={navigate}
            />
          ) : (
            <div className="flex flex-col divide-y divide-gray-800">
              {recentRooms.map((room) => (
                <div
                  key={room.roomId || room._id}
                  className="flex items-center justify-between py-4 gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {formatDate(getCreatedAt(room))}
                    </span>
                    <span className="text-xs text-gray-500">
                      {room.language ?? "—"}
                    </span>
                  </div>
                  <Badge
                    label={
                      room.status === "active"
                        ? "Active"
                        : room.status === "waiting"
                          ? "Waiting"
                          : "Ended"
                    }
                    className={
                      room.status === "active"
                        ? "bg-emerald-900 text-emerald-400 border border-emerald-700"
                        : room.status === "waiting"
                          ? "bg-yellow-900 text-yellow-400 border border-yellow-700"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                    }
                  />
                  <div className="flex-shrink-0">
                    {room.status !== "ended" ? (
                      <button
                        onClick={() => handleRejoin(room.roomId)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-500 px-3 py-1.5 rounded-lg transition-all duration-150"
                      >
                        Rejoin
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 px-3 py-1.5">
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Toast
            message={toast.message}
            success={toast.success}
            error={!toast.success}
          />
        </div>
      )}
    </>
  );
}
