import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button";

export default function PreRoomSetup({ onSuccess }) {
  const accessRef = useRef(null);
  const videoRef = useRef(null);
  const [allAccessGranted, setAllAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEnterRoom = async () => {
    setIsLoading(true);
    setError("");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      accessRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setAllAccessGranted(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError(
          "Camera and microphone access was denied. Please allow permissions in your browser settings and try again.",
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No camera or microphone found. Please connect a device and try again.",
        );
      } else {
        setError("Could not access camera/microphone. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (accessRef.current) {
        accessRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white">
      <h1 className="text-3xl font-bold mb-6 font-mono">Pre-Flight Check</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-96 h-72 bg-black rounded-lg mb-6 object-cover border-2 border-zinc-700"
      />
      {error && (
        <p className="text-red-400 mb-4 text-sm font-mono text-center max-w-sm">
          {error}
        </p>
      )}
      <Button
        onClick={handleEnterRoom}
        disabled={isLoading || allAccessGranted}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold font-mono transition-colors"
      >
        {isLoading ? "Requesting permissions..." : "Enter Room"}
      </Button>
      {allAccessGranted && (
        <p className="text-green-400 mt-4 font-medium font-mono">
          All permissions granted! Entering room...
        </p>
      )}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-zinc-500 hover:text-zinc-300 text-sm font-mono transition-colors"
      >
        ← Go back
      </button>
    </div>
  );
}
