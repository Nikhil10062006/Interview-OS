import { useEffect, useMemo, useState } from "react";
import { roomHeatMap } from "../api/roomAPI.jsx";
import { mockHeatMap } from "../api/mockAPI.jsx";

export const useHeatMap = (sessionId, type) => {
  const [heatMap, setHeatMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const getHeatmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const response =
          type === "mock"
            ? await mockHeatMap(sessionId)
            : await roomHeatMap(sessionId);
        setHeatMap(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    getHeatmap();
  }, [sessionId, type]);

  const intensityMap = useMemo(() => {
    const lineMap = new Map();

    heatMap.forEach((hesitation) => {
      if (lineMap.has(hesitation.lineNumber)) {
        lineMap.set(
          hesitation.lineNumber,
          lineMap.get(hesitation.lineNumber) + 1,
        );
      } else {
        lineMap.set(hesitation.lineNumber, 1);
      }
    });

    const result = new Map();
    for (const key of lineMap.keys()) {
      let intensity = "";
      const events = lineMap.get(key);
      if (events >= 1 && events <= 3) intensity = "low";
      else if (events > 3 && events <= 6) intensity = "medium";
      else intensity = "high";
      result.set(key, intensity);
    }

    return result;
  }, [heatMap]);

  return { intensityMap, loading, error };
};
