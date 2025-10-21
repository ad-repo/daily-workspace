export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface NoteEntry {
  id: number;
  daily_note_id: number;
  content: string;
  content_type: 'rich_text' | 'code' | 'markdown';
  order_index: number;
  created_at: string;
  updated_at: string;
  labels: Label[];
  include_in_report: boolean;
  is_important: boolean;
  is_completed: boolean;
}

export interface DailyNote {
  id: number;
  date: string;
  fire_rating: number;
  daily_goal: string;
  created_at: string;
  updated_at: string;
  entries: NoteEntry[];
  labels: Label[];
}

export interface NoteEntryCreate {
  content: string;
  content_type: 'rich_text' | 'code' | 'markdown';
  order_index: number;
}

export interface NoteEntryUpdate {
  content?: string;
  content_type?: 'rich_text' | 'code' | 'markdown';
  order_index?: number;
}

export interface DailyNoteCreate {
  date: string;
  fire_rating?: number;
}

export interface DailyNoteUpdate {
  fire_rating?: number;
}

