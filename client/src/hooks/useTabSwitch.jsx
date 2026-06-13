import { useEffect, useRef, useState } from "react";

export const useTabSwitch = (enabled, onLimitReached) => {
  const [violationCount, setViolationCount] = useState(0);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const lastViolationTimeRef = useRef(null);
  const violationCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("visibilitychange", triggerViolation);
    return () => document.removeEventListener("visibilitychange", triggerViolation);
  }, [enabled]);

  function triggerViolation() {
    if (!document.hidden) return;

    const now = Date.now();
    if (lastViolationTimeRef.current && now - lastViolationTimeRef.current < 500) return;
    lastViolationTimeRef.current = now;

    violationCountRef.current += 1;
    setViolationCount(violationCountRef.current);

    if (violationCountRef.current >= 3) {
      onLimitReached?.();
    } else {
      setIsWarningVisible(true);
    }
  }

  function dismissWarning() {
    setIsWarningVisible(false);
  }

  return { violationCount, isWarningVisible, dismissWarning };
};