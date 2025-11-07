export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface NoteEntry {
  id: number;
  daily_note_id: number;
  title: string;
  content: string;
  content_type: 'rich_text' | 'code' | 'markdown';
  order_index: number;
  created_at: string;
  updated_at: string;
  labels: Label[];
  include_in_report: boolean;
  is_important: boolean;
  is_completed: boolean;
  is_dev_null: boolean;
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
  title?: string;
  content: string;
  content_type: 'rich_text' | 'code' | 'markdown';
  order_index: number;
}

export interface NoteEntryUpdate {
  title?: string;
  content?: string;
  content_type?: 'rich_text' | 'code' | 'markdown';
  order_index?: number;
}

export interface DailyNoteCreate {
  date: string;
  fire_rating?: number;
  daily_goal?: string;
}

export interface DailyNoteUpdate {
  fire_rating?: number;
  daily_goal?: string;
}

export interface AppSettings {
  id: number;
  sprint_goals: string;
  quarterly_goals: string;
  sprint_start_date: string;
  sprint_end_date: string;
  quarterly_start_date: string;
  quarterly_end_date: string;
  created_at: string;
  updated_at: string;
}

export interface AppSettingsUpdate {
  sprint_goals?: string;
  quarterly_goals?: string;
  sprint_start_date?: string;
  sprint_end_date?: string;
  quarterly_start_date?: string;
  quarterly_end_date?: string;
}

export interface Goal {
  id: number;
  text: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  days_remaining?: number;  // Calculated field relative to queried date
}

export interface GoalCreate {
  text: string;
  start_date: string;
  end_date: string;
}

export interface GoalUpdate {
  text?: string;
  start_date?: string;
  end_date?: string;
}

