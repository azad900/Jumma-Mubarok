// Audio management and Gemini 3.1 Flash TTS client

export type VoiceName = "Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir";

export interface AudioPlaybackEvent {
  isPlaying: boolean;
  isLoading: boolean;
  activeId: string | null;
  activeTitle: string | null;
  activeText: string | null;
  voice: VoiceName;
  currentTime: number;
  duration: number;
}

type AudioListener = (state: AudioPlaybackEvent) => void;

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // cacheKey -> data:audio/wav;base64,...
  private listeners: Set<AudioListener> = new Set();
  private selectedVoice: VoiceName = "Kore";

  private state: AudioPlaybackEvent = {
    isPlaying: false,
    isLoading: false,
    activeId: null,
    activeTitle: null,
    activeText: null,
    voice: "Kore",
    currentTime: 0,
    duration: 0,
  };

  constructor() {
    // Load persisted voice choice if any
    const savedVoice = localStorage.getItem("preferred_tts_voice") as VoiceName;
    if (savedVoice && ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"].includes(savedVoice)) {
      this.selectedVoice = savedVoice;
      this.state.voice = savedVoice;
    }
  }

  public setVoice(voice: VoiceName) {
    this.selectedVoice = voice;
    this.state.voice = voice;
    localStorage.setItem("preferred_tts_voice", voice);
    this.notify();
  }

  public getVoice(): VoiceName {
    return this.selectedVoice;
  }

  public getState(): AudioPlaybackEvent {
    return { ...this.state };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.state.isPlaying = false;
    this.state.isLoading = false;
    this.state.currentTime = 0;
    this.state.duration = 0;
    this.notify();
  }

  public async playText({
    id,
    title,
    text,
    lang = "arabic",
    voice,
  }: {
    id: string;
    title: string;
    text: string;
    lang?: "arabic" | "bangla" | "english";
    voice?: VoiceName;
  }) {
    const voiceToUse = voice || this.selectedVoice;

    // If currently playing this exact item, toggle pause/play
    if (this.state.activeId === id && this.currentAudio) {
      if (this.state.isPlaying) {
        this.currentAudio.pause();
        this.state.isPlaying = false;
        this.notify();
        return;
      } else {
        await this.currentAudio.play();
        this.state.isPlaying = true;
        this.notify();
        return;
      }
    }

    // Otherwise, stop any current audio and start loading
    this.stop();

    this.state.isLoading = true;
    this.state.activeId = id;
    this.state.activeTitle = title;
    this.state.activeText = text;
    this.state.voice = voiceToUse;
    this.notify();

    const cacheKey = `${voiceToUse}::${lang}::${text.trim()}`;

    try {
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        // Request server Gemini TTS endpoint
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: voiceToUse,
            lang,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned status ${response.status}`);
        }

        const data = await response.json();
        if (!data.audioWavBase64) {
          throw new Error("No audio payload returned from Gemini TTS model");
        }

        audioUrl = `data:audio/wav;base64,${data.audioWavBase64}`;
        this.audioCache.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onloadedmetadata = () => {
        this.state.duration = audio.duration || 0;
        this.notify();
      };

      audio.ontimeupdate = () => {
        this.state.currentTime = audio.currentTime;
        this.notify();
      };

      audio.onended = () => {
        this.state.isPlaying = false;
        this.state.currentTime = 0;
        this.notify();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        this.state.isPlaying = false;
        this.state.isLoading = false;
        this.notify();
      };

      await audio.play();
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.notify();
    } catch (err: any) {
      console.warn("Gemini TTS fetch error, falling back to browser speech if applicable:", err);
      this.state.isLoading = false;

      // Fallback: Web Speech API if browser supports it
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.85;
          utterance.lang = lang === "arabic" ? "ar-SA" : lang === "bangla" ? "bn-BD" : "en-US";

          utterance.onstart = () => {
            this.state.isPlaying = true;
            this.notify();
          };
          utterance.onend = () => {
            this.state.isPlaying = false;
            this.notify();
          };
          utterance.onerror = () => {
            this.state.isPlaying = false;
            this.notify();
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          this.state.isPlaying = false;
          this.notify();
        }
      } else {
        this.state.isPlaying = false;
        this.notify();
      }
    }
  }
}

export const audioManager = new AudioService();
