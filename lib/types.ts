export type Status = "upcoming" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null; // ISO date (YYYY-MM-DD)
  estimated_duration: string | null; // AI-suggested or manual, e.g. "about 2 hours"
  attachment_url: string | null; // public URL
  attachment_path: string | null; // object path in the bucket (for deletion)
  attachment_name: string | null; // original file name
  attachment_type: string | null; // MIME type
  created_at: string;
  updated_at: string;
}

// What we send when creating/updating (server fills the rest)
export interface TaskInput {
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null;
  estimated_duration: string | null;
  attachment_url: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}
