import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRoom } from "../../hooks/useRoom.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import Spinner from "../../components/spinner.jsx";
import RoomCard from "./components/roomCard.jsx";

export default function AllRooms() {
  const navigate = useNavigate();
  const {
    rooms,
    loading: roomLoading,
    error: roomError,
    handleGetAllRooms,
  } = useRoom();
  const { user } = useAuth();

  useEffect(() => {
    handleGetAllRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <button
          onClick={() => navigate("/warroom")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </button>

        <h1 className="text-3xl font-bold">All War Rooms</h1>

        {roomLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {!roomLoading && roomError && (
          <p className="text-red-400 text-sm">Could not load rooms.</p>
        )}

        {!roomLoading && !roomError && (rooms?.length ?? 0) === 0 && (
          <p className="text-gray-500 text-sm">
            No rooms yet. Create one from the War Room lobby.
          </p>
        )}

        <div className="space-y-2">
          {(rooms || []).map((room) => (
            <RoomCard key={room._id} room={room} currentUserId={user?._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
