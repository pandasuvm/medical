'use client';
import { useEffect, useRef, useState } from 'react';
export function useTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (ref.current) {
      window.clearInterval(ref.current);
      ref.current = null;
    }
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);
  return { running, seconds, start: () => setRunning(true), stop: () => setRunning(false), reset: () => setSeconds(0) };
}
