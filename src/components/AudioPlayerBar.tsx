"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface AudioPlayerBarProps {
  audioUrl?: string;
  fileName: string;
  duration: number;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export default function AudioPlayerBar({
  audioUrl,
  fileName,
  duration,
  onTimeUpdate,
  className,
}: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);
    onTimeUpdate?.(cur);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onTimeUpdate?.(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    onTimeUpdate?.(val);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  };

  if (!audioUrl) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 shadow-lg backdrop-blur-md",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Main Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          title={isPlaying ? "Pause playback" : "Play audio"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <button
          onClick={handleRestart}
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Restart from beginning"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Track & Time Scrubber */}
      <div className="flex-1 w-full space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-cyan-300 font-medium truncate max-w-[200px] sm:max-w-xs">
            {fileName}
          </span>
          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-white">{formatDuration(currentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-full appearance-none bg-slate-800 cursor-pointer accent-cyan-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${progressPercent}%, #1e293b ${progressPercent}%, #1e293b 100%)`,
            }}
          />
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={toggleMute}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-16 sm:w-20 h-1.5 rounded-full appearance-none bg-slate-800 cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
