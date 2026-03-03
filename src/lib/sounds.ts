import { Move } from "chess.js";

let audioContext: AudioContext | null = null;
const soundsCache = new Map<string, AudioBuffer>();

type Sound = "move" | "capture" | "illegalMove" | "check";
const soundUrls: Record<Sound, string> = {
  move: "/sounds/move.mp3",
  capture: "/sounds/capture.mp3",
  illegalMove: "/sounds/error.mp3",
  check: "/sounds/check.mp3",
};
export const play = async (sound: Sound) => {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();

  let audioBuffer = soundsCache.get(soundUrls[sound]);
  if (!audioBuffer) {
    const res = await fetch(soundUrls[sound]);
    const buffer = await audioContext.decodeAudioData(await res.arrayBuffer());
    audioBuffer = buffer;
    soundsCache.set(soundUrls[sound], buffer);
  }

  const audioSrc = audioContext.createBufferSource();
  audioSrc.buffer = audioBuffer;
  const volume = audioContext.createGain();
  volume.gain.value = 0.3;
  audioSrc.connect(volume);
  volume.connect(audioContext.destination);
  audioSrc.start();
};

export const playCaptureSound = () => play("capture");
export const playIllegalMoveSound = () => play("illegalMove");
export const playMoveSound = () => play("move");
export const playCheckSound = () => play("check");

export const playSoundFromMove = (move: Move | null) => {
  if (!move) return playIllegalMoveSound();
  if (move.san.includes("+") || move.san.includes("#")) return playCheckSound();
  if (move.captured) return playCaptureSound();
  return playMoveSound();
};
