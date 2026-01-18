import { useEffect, useState } from "react";

export default function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
