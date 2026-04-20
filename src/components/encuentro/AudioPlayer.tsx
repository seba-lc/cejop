"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration?: number;
}

export default function AudioPlayer({ src, title, duration = 4643 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audio.play()
        .then(() => { setPlaying(true); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [playing]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setTotalDuration(audioRef.current.duration);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  }, []);

  const seekToTimestamp = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => seekToTimestamp((e as CustomEvent).detail.seconds);
    window.addEventListener("cejop-seek", handler);
    return () => window.removeEventListener("cejop-seek", handler);
  }, [seekToTimestamp]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div id="audio-player" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-7">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        preload="none"
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cejop-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-encode-var)" }}>
            E1
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm md:text-base leading-tight truncate"
            style={{ fontFamily: "var(--font-montserrat-var)" }}>
            {title}
          </p>
          <p className="text-white/40 text-xs mt-0.5">18 de abril de 2026 · CEJOP Tucumán</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="relative h-2 bg-white/10 rounded-full mb-1.5 cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-cejop-blue rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={totalDuration}
          step={1}
          value={currentTime}
          onChange={handleSeek}
          className="sr-only"
          aria-label="Progreso del audio"
        />
        {/* Invisible overlay for actual interaction */}
        <div
          className="relative h-2 -mt-3.5 rounded-full cursor-pointer opacity-0"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            seekToTimestamp(ratio * totalDuration);
          }}
          style={{ height: "8px" }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-white/40 text-xs tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-white/40 text-xs tabular-nums">{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={loading}
          className="w-12 h-12 rounded-full bg-cejop-blue hover:bg-cejop-blue-secondary transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-60"
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : playing ? (
            <Pause size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-white ml-0.5" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="text-white/40 hover:text-white transition-colors p-1.5 -ml-1"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <span className="text-white/25 text-xs ml-auto hidden sm:block">
          {playing ? "Reproduciendo…" : "Presioná play para escuchar"}
        </span>
      </div>
    </div>
  );
}
