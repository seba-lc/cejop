"use client";

type Props = {
  timestamp: number;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
};

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SeekButton({
  timestamp,
  className = "",
  children,
  ariaLabel,
}: Props) {
  const onClick = () => {
    window.dispatchEvent(
      new CustomEvent("audio-seek", { detail: { time: timestamp } })
    );
    document.getElementById("audio-navegable")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 text-cejop-blue hover:text-cejop-blue-variant transition-colors " +
        className
      }
      aria-label={ariaLabel || `Saltar a ${formatTimestamp(timestamp)}`}
    >
      {children ?? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-xs font-medium tabular-nums">
            {formatTimestamp(timestamp)}
          </span>
        </>
      )}
    </button>
  );
}
