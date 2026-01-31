import React, { useEffect, useRef, useState } from "react";

type Phase = "inhale" | "hold" | "exhale";

const defaultDurations = { inhale: 4, hold: 2, exhale: 6 };

export default function JustBreathe() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [progress, setProgress] = useState(0);
  const [durations, setDurations] = useState(defaultDurations);
  const intervalRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number>(0);

  useEffect(() => {
    if (!running) {
      setProgress(0);
      setPhase("inhale");
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    const sequence: Phase[] = ["inhale", "hold", "exhale"];
    let idx = 0;
    phaseStartRef.current = performance.now();
    setPhase(sequence[idx]);

    intervalRef.current = window.setInterval(() => {
      const now = performance.now();
      const curPhase = sequence[idx];
      const duration = durations[curPhase] * 1000;
      const elapsed = now - phaseStartRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (elapsed >= duration) {
        idx = (idx + 1) % sequence.length;
        phaseStartRef.current = now;
        setPhase(sequence[idx]);
        setProgress(0);
      }
    }, 100);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, durations]);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = usePrefersReducedMotion();

  function toggle() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setProgress(0);
    setPhase("inhale");
  }

  return (
    <div className="jb-root">
      <div className="jb-stage">
        <BreathingCircle
          phase={phase}
          progress={progress}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      <div className="jb-controls">
        <button onClick={toggle} className="btn-primary">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="btn-ghost">
          Reset
        </button>
      </div>

      <div className="jb-settings">
        <label>
          Inhale: {durations.inhale}s
          <input
            type="range"
            min={1}
            max={8}
            value={durations.inhale}
            onChange={(e) =>
              setDurations((d) => ({ ...d, inhale: Number(e.target.value) }))
            }
          />
        </label>
        <label>
          Hold: {durations.hold}s
          <input
            type="range"
            min={0}
            max={8}
            value={durations.hold}
            onChange={(e) =>
              setDurations((d) => ({ ...d, hold: Number(e.target.value) }))
            }
          />
        </label>
        <label>
          Exhale: {durations.exhale}s
          <input
            type="range"
            min={1}
            max={12}
            value={durations.exhale}
            onChange={(e) =>
              setDurations((d) => ({ ...d, exhale: Number(e.target.value) }))
            }
          />
        </label>
      </div>

      <div className="jb-hint">
        <small>
          No data is logged. Use this for short regulation — accessible controls
          included.
        </small>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return prefers;
}

function BreathingCircle({
  phase,
  progress,
  prefersReducedMotion,
}: {
  phase: Phase;
  progress: number;
  prefersReducedMotion: boolean;
}) {
  const baseSize = 120;
  // Map progress to scale: inhale -> 1 to 1.8, hold -> steady, exhale -> 1.8 to 1
  let scale = 1;
  if (prefersReducedMotion) scale = 1;
  else if (phase === "inhale") scale = 1 + 0.8 * progress;
  else if (phase === "hold") scale = 1.8;
  else if (phase === "exhale") scale = 1.8 - 0.8 * progress;

  const style: React.CSSProperties = {
    width: baseSize,
    height: baseSize,
    transform: `scale(${scale})`,
    transition: prefersReducedMotion ? "none" : "transform 100ms linear",
  };

  return (
    <div className="circle-wrapper">
      <div className="circle" style={style} aria-hidden />
      <div className="phase-label">
        <strong>{phase.toUpperCase()}</strong>
      </div>
    </div>
  );
}
