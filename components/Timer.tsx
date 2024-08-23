import { useEffect, useState } from "preact/hooks";

interface TimerProps {
  time: number;
}

export function Timer({ time }: TimerProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (progress > 0) {
      setProgress(Math.floor((time / 30) * 100));
    }
  }, [time]);

  return (
    <div class="flex flex-row-reverse w-full bg-mocha-surface0 rounded-full h-2.5">
      <div
        class="bg-gradient-to-r h-2.5 rounded-full transition ease-linear"
        style={{ width: `${progress}%` }}
      >
      </div>
    </div>
  );
}
