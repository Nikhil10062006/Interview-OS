import { useEffect, useRef, useState } from "react";

export const useHesitation = () => {
  const lastTypedRef = useRef(null);
  const timerId = useRef(null);
  const isHesitatingRef = useRef(false);
  const previousCodeRef = useRef("");

  const [hesitationsArray, setHesitationsArray] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timerId.current);
      lastTypedRef.current = null;
      isHesitatingRef.current = false;
    };
  }, []);

  function handleTimer() {
    timerId.current = setTimeout(() => {
      isHesitatingRef.current = true;
    }, 10000);
  }

  function handleTyping(code) {
    if (code === undefined || code === null) return;

    const previousCode = previousCodeRef.current;
    const charsDeleted = previousCode.length - code.length;

    // BUG FIXED: Mass Deletion now calculates and includes the lineNumber
    if (charsDeleted > 30) {
      const lineNumber = code.split("\n").length;
      const deletionHesitation = {
        kind: "massDeletion",
        duration: 0,
        charsDeleted: charsDeleted,
        lineNumber: lineNumber, // <-- Line number is now safely tracked
        timestamp: Date.now(),
      };
      setHesitationsArray((prev) => [...prev, deletionHesitation]);
    }

    previousCodeRef.current = code;
    clearTimeout(timerId.current);

    if (isHesitatingRef.current && lastTypedRef.current) {
      const currentLines = code.split("\n").length;
      const pauseHesitation = {
        kind: "longPause",
        lineNumber: currentLines || null,
        duration: Math.round((Date.now() - lastTypedRef.current) / 1000),
        timestamp: Date.now(),
      };
      setHesitationsArray((prev) => [...prev, pauseHesitation]);
    }

    isHesitatingRef.current = false;
    lastTypedRef.current = Date.now();
    handleTimer();
  }

  return { handleTyping, hesitationsArray };
};
