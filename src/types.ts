export interface SurahAyah {
  ayahNumber: number;
  arabic: string;
  banglaPronunciation: string;
  banglaMeaning: string;
  englishMeaning: string;
  sectionName?: string;
  virtueNote?: string;
}

export interface KahfStory {
  id: string;
  titleBangla: string;
  titleEnglish: string;
  theme: string;
  ayatRange: string;
  lessons: string[];
  summaryBangla: string;
  keyAyahArabic: string;
  keyAyahMeaning: string;
}

export interface DuroodItem {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  arabic: string;
  banglaTransliteration: string;
  banglaMeaning: string;
  virtue: string;
  defaultTarget: number;
}

export interface FridayDuaItem {
  id: string;
  titleBangla: string;
  timing: "between_khutbahs" | "before_maghrib" | "general_jummah";
  timingLabelBangla: string;
  arabic: string;
  banglaTransliteration: string;
  banglaMeaning: string;
  reference: string;
  significance: string;
}

export interface SunnahItem {
  id: string;
  titleBangla: string;
  titleEnglish: string;
  description: string;
  hadithReference: string;
  completed: boolean;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  activeId: string | null;
  activeTitle: string | null;
  activeText: string | null;
  voice: "Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir";
  progress: number;
}
