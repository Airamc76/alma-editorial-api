export type Project = {
  id: string;
  client_id: string;
  title?: string;
  updated_at?: string;
  [k: string]: any;
};

export type Progress = {
  phase: number;
  percent: number | null;
};
