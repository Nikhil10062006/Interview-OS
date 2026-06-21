import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../../../hooks/useRoom.jsx";
import { useToast } from "../../../hooks/useToast.jsx";
import { useAuth } from "../../../hooks/useAuth.jsx";
import Button from "../../../components/button.jsx";
import Toast from "../../../components/toast.jsx";
import Modal from "../../../components/modal.jsx";
import Spinner from "../../../components/spinner.jsx";
import { Copy } from "lucide-react";
export default function RoomHeader({ onEndRoom }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room, error: roomError, clearRoom } = useRoom();
  const { toast, showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const interviewerId = room?.interviewer?._id ?? room?.interviewer;
  const isInterviewer =
    user && interviewerId && String(interviewerId) === String(user._id);

  useEffect(() => {
    if (roomError) showToast(roomError, false);
  }, [roomError]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(room.roomId);
      showToast("Room ID copied", true);
    } catch {
      showToast("Failed to copy Room ID", false);
    }
  }

  async function endRoom() {
    setIsEnding(true);
    try {
      await onEndRoom();
    } finally {
      setIsEnding(false); // always reset, even on failure
    }
  }
  if (!room) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 font-mono">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Room</span>
        <span className="text-indigo-400 font-semibold tracking-widest">
          {room.roomId}
        </span>
        <Button onClick={copyRoomId}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <div>
        {isInterviewer ? (
          <Button loading={isEnding} onClick={() => setShowConfirm(true)}>
            End Room
          </Button>
        ) : (
          <Button onClick={() => navigate("/warroom")}>Leave Room</Button>
        )}
      </div>

      {showConfirm && (
        <Modal isOpen onClose={() => setShowConfirm(false)} title="End Room?">
          <p className="text-gray-300 text-sm font-mono mb-4">
            This will end the session for everyone. Are you sure?
          </p>
          <div className="flex gap-3">
            <Button loading={isEnding} onClick={endRoom}>
              Yes, End Room
            </Button>
            <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {toast.show && (
        <Toast
          success={toast.success}
          error={!toast.success}
          message={toast.message}
        />
      )}
    </div>
  );
}
