"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import type { Timeline, AudioMetrics, AudioPeaks } from "@/types/encuentro1";

type Props = {
  audioUrl: string;
  timeline: Timeline;
  audio: AudioMetrics;
  audioPeaks: AudioPeaks | null;
};

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioNavegable({
  audioUrl,
  timeline,
  audio,
  audioPeaks,
}: Props) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(
    new Set(Object.keys(timeline.speaker_colors))
  );

  // Init wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    const mediaEl = new Audio();
    mediaEl.preload = "metadata";
    mediaEl.crossOrigin = "anonymous";
    mediaEl.src = audioUrl;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      media: mediaEl,
      peaks: audioPeaks ? [audioPeaks.peaks] : undefined,
      duration: audioPeaks?.duration_s,
      waveColor: "#B7BFE7",
      progressColor: "#2C46BF",
      cursorColor: "#1A1A2E",
      height: 64,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      normalize: !audioPeaks,
    });
    wsRef.current = ws;

    // Si pasamos peaks precomputados, la waveform queda lista al instante
    // y el audio se carga progresivamente vía <audio> HTML5 (streaming).
    if (audioPeaks) setIsReady(true);

    ws.on("ready", () => setIsReady(true));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (t) => setCurrentTime(t));
    ws.on("finish", () => setIsPlaying(false));

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    mediaEl.addEventListener("waiting", onWaiting);
    mediaEl.addEventListener("playing", onPlaying);
    mediaEl.addEventListener("canplay", onCanPlay);

    return () => {
      mediaEl.removeEventListener("waiting", onWaiting);
      mediaEl.removeEventListener("playing", onPlaying);
      mediaEl.removeEventListener("canplay", onCanPlay);
      ws.destroy();
      wsRef.current = null;
    };
  }, [audioUrl, audioPeaks]);

  // Listen for external seek events (from cards/insights)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ time: number }>;
      const ws = wsRef.current;
      if (!ws || !isReady) return;
      ws.setTime(ce.detail.time);
      if (!isPlaying) ws.play();
    };
    window.addEventListener("audio-seek", handler);
    return () => window.removeEventListener("audio-seek", handler);
  }, [isReady, isPlaying]);

  // Active segment (for highlight + auto-scroll)
  const activeIndex = useMemo(() => {
    return timeline.segments.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );
  }, [currentTime, timeline.segments]);

  useEffect(() => {
    if (activeIndex < 0 || !transcriptRef.current) return;
    const el = transcriptRef.current.querySelector<HTMLElement>(
      `[data-seg-idx="${activeIndex}"]`
    );
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const togglePlay = () => {
    const ws = wsRef.current;
    if (!ws || !isReady) return;
    ws.playPause();
  };

  const seekTo = (t: number) => {
    const ws = wsRef.current;
    if (!ws || !isReady) return;
    ws.setTime(t);
    if (!isPlaying) ws.play();
  };

  const toggleSpeaker = (speaker: string) => {
    setActiveSpeakers((prev) => {
      const next = new Set(prev);
      if (next.has(speaker)) next.delete(speaker);
      else next.add(speaker);
      return next;
    });
  };

  const speakers = Object.keys(timeline.speaker_colors);
  const duration = timeline.duration_s;
  const filteredSegments = timeline.segments.filter((s) =>
    activeSpeakers.has(s.speaker)
  );

  return (
    <section
      id="audio-navegable"
      aria-label="Reproductor del encuentro"
      className="mb-10"
    >
      <h2 className="text-lg sm:text-xl font-montserrat font-bold text-cejop-dark mb-3">
        Grabación navegable
      </h2>

      <div className="bg-white border border-cejop-blue-light/40 rounded-xl p-4 sm:p-5 shadow-sm">
        {/* Player controls */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isReady}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-11 h-11 rounded-full bg-cejop-blue text-white flex items-center justify-center hover:bg-cejop-blue-variant transition-colors disabled:opacity-40 shrink-0"
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-encode uppercase tracking-wide text-cejop-dark/60">
              {!isReady
                ? "Cargando audio..."
                : isBuffering
                ? "Buffereando..."
                : "Reproductor"}
            </div>
            <div className="text-sm font-bold text-cejop-dark tabular-nums">
              {formatTime(currentTime)}{" "}
              <span className="text-cejop-dark/50">/ {formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Waveform */}
        <div ref={waveformRef} className="w-full" />

        {/* Speaker timeline strip */}
        <div className="mt-3">
          <div className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60 mb-1">
            Línea de tiempo por orador
          </div>
          <div className="relative w-full h-5 bg-cejop-bg rounded overflow-hidden">
            {timeline.segments.map((seg, i) => {
              const left = (seg.start / duration) * 100;
              const width = ((seg.end - seg.start) / duration) * 100;
              const color =
                timeline.speaker_colors[seg.speaker] || "#999";
              const dim = !activeSpeakers.has(seg.speaker);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => seekTo(seg.start)}
                  className="absolute top-0 h-full hover:opacity-100 transition-opacity"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 0.1)}%`,
                    backgroundColor: color,
                    opacity: dim ? 0.15 : 0.85,
                  }}
                  aria-label={`${seg.speaker} en ${formatTime(seg.start)}`}
                  title={`${seg.speaker} · ${formatTime(seg.start)}`}
                />
              );
            })}
            {/* Aplausos / risas markers */}
            {audio.claps.map((c, i) => (
              <div
                key={`clap-${i}`}
                className="absolute top-0 h-full w-px bg-cejop-dark"
                style={{ left: `${(c.time / duration) * 100}%` }}
                title={`Aplauso en ${formatTime(c.time)}`}
              />
            ))}
            {audio.laughs.map((l, i) => (
              <div
                key={`laugh-${i}`}
                className="absolute top-0 h-full w-px bg-amber-500"
                style={{ left: `${(l.time / duration) * 100}%` }}
                title={`Risa en ${formatTime(l.time)}`}
              />
            ))}
            {/* Current time indicator */}
            <div
              className="absolute top-0 h-full w-0.5 bg-cejop-dark pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          {(audio.pending_applause_detection ||
            audio.pending_laughter_detection) && (
            <div className="mt-1 text-[10px] text-cejop-dark/50">
              Aplausos / risas: detección ML pendiente
            </div>
          )}
        </div>

        {/* Speaker filters */}
        <div className="mt-4">
          <div className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60 mb-2">
            Filtrar transcripción por orador
          </div>
          <div className="flex flex-wrap gap-1.5">
            {speakers.map((sp) => {
              const color = timeline.speaker_colors[sp];
              const active = activeSpeakers.has(sp);
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleSpeaker(sp)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    active
                      ? "border-transparent text-white"
                      : "border-cejop-blue-light/60 text-cejop-dark/50 bg-white"
                  }`}
                  style={
                    active
                      ? { backgroundColor: color }
                      : undefined
                  }
                  aria-pressed={active}
                >
                  {sp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transcript */}
        <div className="mt-4">
          <div className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60 mb-2">
            Transcripción ({filteredSegments.length} segmentos)
          </div>
          <div
            ref={transcriptRef}
            className="max-h-96 overflow-y-auto pr-2 space-y-2"
          >
            {filteredSegments.map((seg) => {
              const idx = timeline.segments.indexOf(seg);
              const color = timeline.speaker_colors[seg.speaker] || "#888";
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  data-seg-idx={idx}
                  onClick={() => seekTo(seg.start)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? "bg-cejop-blue-light/40 border-cejop-blue"
                      : "bg-white border-cejop-blue-light/30 hover:bg-cejop-bg"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-cejop-dark/70">
                      {seg.speaker}
                    </span>
                    <span className="text-xs text-cejop-dark/40 tabular-nums ml-auto">
                      {formatTime(seg.start)}
                    </span>
                  </div>
                  <p className="text-sm text-cejop-dark leading-relaxed">
                    {seg.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
