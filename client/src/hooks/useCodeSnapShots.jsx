// useCodeSnapshots.jsx
import { useEffect, useRef } from "react";

export const useCodeSnapshots = (codeRef, language) => {
  const snapshotsRef = useRef([]);

  useEffect(() => {
    const id = setInterval(() => {
      const code = codeRef.current;
      if (!code) return; 
      snapshotsRef.current.push({
        code,
        language,
        timestamp: new Date(),
      });
    }, 15000);

    return () => clearInterval(id);
  }, [language]);
  return snapshotsRef;
};