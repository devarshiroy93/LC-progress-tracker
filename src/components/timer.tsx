import { useEffect, useState } from "react";

type TimerProps = {
  onTick?: (seconds: number) => void;
};

export default function Timer({ onTick }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Notify parent AFTER render
  useEffect(() => {
    onTick?.(seconds);
  }, [seconds, onTick]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="text-center text-textSecondary text-sm">
      Time Elapsed:{" "}
      <span className="font-medium text-textPrimary">
        {minutes}:{remainingSeconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
