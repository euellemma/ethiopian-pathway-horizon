
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfo {
  name: string;
  gender: "Male" | "Female";
  highschool: string;
  intendedCollege: string;
  fieldOfStudy: string;
  fundingSources: string;
  city: string;
  levelOfStudy: "Associate" | "Bachelor" | "Master" | "PhD";
  gapYears: number;
  intakeYear: string;
}

export interface ResearchDocs {
  "why-usa": string;
  "why-college": string;
  "why-field": string;
  "field-and-careers": string;
}

export interface TimelineItem {
  id: string;
  title: string;
  imageUrl: string;
  slides: Array<{
    text: string;
    subtext: string;
    imageUrl: string;
  }>;
  quiz: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface TimelineProgress {
  [id: string]: {
    completed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  };
}

export interface QuestionItem {
  id: string;
  question: string;
  label: string;
  isMostCommon: boolean;
  sampleAnswers: {
    good: Array<{ text: string; why: string; voiceUrl: string }>;
    bad: Array<{ text: string; why: string; voiceUrl: string }>;
  };
  doc: string;
  variations: Array<{ text: string; voiceUrl: string }>;
  researchInfo?: string;
}

export interface QuestionProgress {
  [id: string]: {
    answer: string;
    feedback: string;
    completed: boolean;
  };
}

export interface InterviewSession {
  id: string;
  title: string;
  date: string;
  rating: number;
  summary: string;
  questions: Array<{
    question: string;
    answer: string;
    feedback: string;
    improvedAnswer: string;
  }>;
}

interface HorizonState {
  onboardingCompleted: boolean;
  userInfo: UserInfo | null;
  researchDocs: ResearchDocs | null;
  timelineItems: TimelineItem[];
  timelineProgress: TimelineProgress;
  questions: QuestionItem[];
  questionProgress: QuestionProgress;
  interviewSessions: InterviewSession[];
  totalPoints: number;
  
  // Actions
  setOnboardingCompleted: (completed: boolean) => void;
  setUserInfo: (info: UserInfo) => void;
  setResearchDocs: (docs: ResearchDocs) => void;
  setTimelineItems: (items: TimelineItem[]) => void;
  setQuestions: (questions: QuestionItem[]) => void;
  updateTimelineProgress: (id: string, progress: { completed?: boolean; correctAnswers?: number; totalQuestions?: number }) => void;
  updateQuestionProgress: (id: string, progress: { answer?: string; feedback?: string; completed?: boolean }) => void;
  addInterviewSession: (session: InterviewSession) => void;
  addPoints: (points: number) => void;
  clearAllData: () => void;
}

const initialState = {
  onboardingCompleted: false,
  userInfo: null,
  researchDocs: null,
  timelineItems: [],
  timelineProgress: {},
  questions: [],
  questionProgress: {},
  interviewSessions: [],
  totalPoints: 0,
};

export const useStore = create<HorizonState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      
      setUserInfo: (info) => set({ userInfo: info }),
      
      setResearchDocs: (docs) => set({ researchDocs: docs }),
      
      setTimelineItems: (items) => set({ timelineItems: items }),
      
      setQuestions: (questions) => set({ questions: questions }),
      
      updateTimelineProgress: (id, progress) => 
        set((state) => {
          const currentProgress = state.timelineProgress[id] || { completed: false, correctAnswers: 0, totalQuestions: 0 };
          return {
            timelineProgress: {
              ...state.timelineProgress,
              [id]: {
                ...currentProgress,
                ...progress,
              },
            },
          };
        }),
      
      updateQuestionProgress: (id, progress) =>
        set((state) => {
          const currentProgress = state.questionProgress[id] || { answer: '', feedback: '', completed: false };
          return {
            questionProgress: {
              ...state.questionProgress,
              [id]: {
                ...currentProgress,
                ...progress,
              },
            },
          };
        }),
      
      addInterviewSession: (session) =>
        set((state) => ({
          interviewSessions: [...state.interviewSessions, session],
        })),
      
      addPoints: (points) =>
        set((state) => ({
          totalPoints: state.totalPoints + points,
        })),
      
      clearAllData: () => set(initialState),
    }),
    {
      name: 'horizon-storage',
    }
  )
);
