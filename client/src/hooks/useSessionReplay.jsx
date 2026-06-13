import { useState, useEffect, useRef } from "react";
import { getSnapshots } from "../api/mockAPI.jsx";
import { replaySnap } from "../api/roomAPI.jsx";

export const useSessionReplay = (sessionId, type) => {
  const [snapshots, setSnapshots] = useState([]);
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const response =
          type === "mock"
            ? await getSnapshots(sessionId)
            : await replaySnap(sessionId);
        setSnapshots(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, type]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setIdx((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isPlaying, snapshots.length]);

  function play() {
    if (idx < snapshots.length - 1) setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function seek(newIdx) {
    setIdx(newIdx);
  }

  return {
    snapshots,
    currentSnapshot: snapshots[idx] || null,
    idx,
    isPlaying,
    loading,
    error,
    play,
    pause,
    seek,
  };
};
