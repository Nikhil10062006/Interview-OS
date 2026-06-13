import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../../hooks/useRoom.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import Button from "../../components/button.jsx";
import Toast from "../../components/toast.jsx";
import Modal from "../../components/modal.jsx";
import Input from "../../components/input.jsx";
import Badge from "../../components/badge.jsx";
import { Copy, MessageCircle, ArrowRight, Shield, Users } from "lucide-react";
import PageWrapper from "../../components/pageWrapper.jsx";
function statusDot(status) {
  if (status === "active") return "bg-green-400 animate-pulse";
  if (status === "waiting") return "bg-yellow-400";
  return "bg-gray-600";
}
function statusBadgeVariant(status) {
  if (status === "active") return "success";
  if (status === "waiting") return "warning";
  return "default";
}

export default function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    handleCreateRoom,
    handleJoinRoom,
    handleGetAllRooms,
    room,
    rooms,
    loading: roomLoading,
    clearRoom,
  } = useRoom();
  const { toast, showToast } = useToast();

  const [roomId, setRoomId] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const pendingAction = useRef(null);

  useEffect(() => {
    clearRoom();
    handleGetAllRooms().catch(() => {});
  }, []);

  useEffect(() => {
    if (!room || !pendingAction.current) return;
    const action = pendingAction.current;
    pendingAction.current = null;

    if (action === "join") {
      navigate(`/warroom/${room.roomId}`);
      return;
    }
    if (action === "create") {
      setShowShareModal(true);
    }
  }, [room]);

  async function handleCreate() {
    try {
      setIsCreating(true);
      pendingAction.current = "create";
      await handleCreateRoom();
    } catch (err) {
      pendingAction.current = null;
      showToast(err.response?.data?.message || "Failed to create room", false);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoomIdChange(e) {
    const value = e.target.value;
    setRoomId(value);
    if (value.length === 8) {
      try {
        pendingAction.current = "join";
        await handleJoinRoom(value);
      } catch (err) {
        pendingAction.current = null;
        showToast(err.response?.data?.message || "Failed to join room", false);
      }
    }
  }

  async function copyRoomId() {
    await navigator.clipboard.writeText(room.roomId);
    showToast("Room ID copied!", true);
  }

  function closeJoinModal() {
    setShowJoinModal(false);
    setRoomId("");
  }

  const recentRooms = rooms.slice(0, 4);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-950 text-white font-mono">
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 tracking-widest uppercase">
                Live
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">War Room</h1>
            <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
              Real-time 1v1 technical interview rooms. Code together, run it
              instantly, and track every hesitation. A room takes ten seconds to
              spin up.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interviewer */}
            <div className="border border-gray-800 hover:border-indigo-600 transition-colors rounded-xl p-6 bg-gray-900 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    Interviewer
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Create a Room
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Generate a private room, share the ID with your candidate, and
                start the session. You control problems and pacing.
              </p>
              <Button
                loading={isCreating}
                onClick={handleCreate}
                className="w-full justify-center"
              >
                Create Room <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Candidate */}
            <div className="border border-gray-800 hover:border-indigo-600 transition-colors rounded-xl p-6 bg-gray-900 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    Candidate
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Join a Room
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enter the 8-character Room ID shared by your interviewer to jump
                straight into the session — no setup needed.
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowJoinModal(true)}
                className="w-full justify-center"
              >
                Join Room <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {recentRooms.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Recent Sessions
                </p>
                <button
                  onClick={() => navigate("/warroom/all-rooms")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {recentRooms.map((r) => {
                  const isInterviewer =
                    r.interviewer?.username === user?.username;
                  return (
                    <div
                      key={r._id}
                      onClick={() => {
                        if (r.status === "ended") {
                          navigate(`/warroom/${r.roomId}/detail`);
                        } else {
                          navigate(`/warroom/${r.roomId}`);
                        }
                      }}
                      className="flex items-center justify-between border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 bg-gray-900/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${statusDot(r.status)}`}
                        />
                        <div>
                          <p className="text-sm text-white tracking-widest">
                            {r.roomId}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isInterviewer ? "Interviewer" : "Candidate"}
                            {r.language ? ` · ${r.language}` : ""}
                            {r.startedAt
                              ? ` · ${new Date(r.startedAt).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusBadgeVariant(r.status)}>
                          {r.status}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {toast.show && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
            <Toast
              success={toast.success}
              error={!toast.success}
              message={toast.message}
            />
          </div>
        )}

        {showShareModal && room && (
          <Modal
            isOpen
            onClose={() => navigate(`/warroom/${room.roomId}`)}
            title="Room Created"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Share this ID with your candidate. They'll be dropped straight
                into the session.
              </p>
              <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
                <span className="flex-1 text-white font-mono tracking-[0.3em] text-lg select-all">
                  {room.roomId}
                </span>
                <button
                  onClick={copyRoomId}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=Join my Interview OS room: ${room.roomId}`,
                      "_blank",
                    )
                  }
                  className="flex-1 justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => navigate(`/warroom/${room.roomId}`)}
                  className="flex-1 justify-center"
                >
                  Enter Room <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {showJoinModal && (
          <Modal isOpen onClose={closeJoinModal} title="Join a Room">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Paste or type the 8-character ID your interviewer sent you.
                You'll be connected automatically.
              </p>
              <Input
                label="Room ID"
                placeholder="e.g. AB1234ds"
                value={roomId}
                name="roomId"
                disabled={roomLoading}
                onChange={handleRoomIdChange}
                maxLength={8}
              />
              {roomLoading && (
                <div className="flex items-center gap-2 text-sm text-indigo-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Connecting to room…
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </PageWrapper>
  );
}
