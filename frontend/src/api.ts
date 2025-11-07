import axios from 'axios';
import type {
  DailyNote,
  DailyNoteCreate,
  DailyNoteUpdate,
  NoteEntry,
  NoteEntryCreate,
  NoteEntryUpdate,
  Goal,
  GoalCreate,
  GoalUpdate,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Daily Notes API
export const notesApi = {
  getAll: async (): Promise<DailyNote[]> => {
    const response = await api.get<DailyNote[]>('/api/notes/');
    return response.data;
  },

  getByDate: async (date: string): Promise<DailyNote> => {
    const response = await api.get<DailyNote>(`/api/notes/${date}`);
    return response.data;
  },

  create: async (note: DailyNoteCreate): Promise<DailyNote> => {
    const response = await api.post<DailyNote>('/api/notes/', note);
    return response.data;
  },

  update: async (date: string, update: DailyNoteUpdate): Promise<DailyNote> => {
    const response = await api.put<DailyNote>(`/api/notes/${date}`, update);
    return response.data;
  },

  delete: async (date: string): Promise<void> => {
    await api.delete(`/api/notes/${date}`);
  },

  getByMonth: async (year: number, month: number): Promise<DailyNote[]> => {
    const response = await api.get<DailyNote[]>(`/api/notes/month/${year}/${month}`);
    return response.data;
  },
};

// Entries API
export const entriesApi = {
  getForDate: async (date: string): Promise<NoteEntry[]> => {
    const response = await api.get<NoteEntry[]>(`/api/entries/note/${date}`);
    return response.data;
  },

  create: async (date: string, entry: NoteEntryCreate): Promise<NoteEntry> => {
    const response = await api.post<NoteEntry>(`/api/entries/note/${date}`, entry);
    return response.data;
  },

  update: async (entryId: number, update: NoteEntryUpdate): Promise<NoteEntry> => {
    const response = await api.put<NoteEntry>(`/api/entries/${entryId}`, update);
    return response.data;
  },

  delete: async (entryId: number): Promise<void> => {
    await api.delete(`/api/entries/${entryId}`);
  },

  get: async (entryId: number): Promise<NoteEntry> => {
    const response = await api.get<NoteEntry>(`/api/entries/${entryId}`);
    return response.data;
  },
};

// Goals API
export const goalsApi = {
  // Sprint Goals
  getAllSprints: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/api/goals/sprint');
    return response.data;
  },

  getSprintForDate: async (date: string): Promise<Goal> => {
    const response = await api.get<Goal>(`/api/goals/sprint/${date}`);
    return response.data;
  },

  createSprint: async (goal: GoalCreate): Promise<Goal> => {
    const response = await api.post<Goal>('/api/goals/sprint', goal);
    return response.data;
  },

  updateSprint: async (goalId: number, update: GoalUpdate): Promise<Goal> => {
    const response = await api.put<Goal>(`/api/goals/sprint/${goalId}`, update);
    return response.data;
  },

  deleteSprint: async (goalId: number): Promise<void> => {
    await api.delete(`/api/goals/sprint/${goalId}`);
  },

  // Quarterly Goals
  getAllQuarterly: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/api/goals/quarterly');
    return response.data;
  },

  getQuarterlyForDate: async (date: string): Promise<Goal> => {
    const response = await api.get<Goal>(`/api/goals/quarterly/${date}`);
    return response.data;
  },

  createQuarterly: async (goal: GoalCreate): Promise<Goal> => {
    const response = await api.post<Goal>('/api/goals/quarterly', goal);
    return response.data;
  },

  updateQuarterly: async (goalId: number, update: GoalUpdate): Promise<Goal> => {
    const response = await api.put<Goal>(`/api/goals/quarterly/${goalId}`, update);
    return response.data;
  },

  deleteQuarterly: async (goalId: number): Promise<void> => {
    await api.delete(`/api/goals/quarterly/${goalId}`);
  },
};

export default api;

