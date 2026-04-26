export interface Document {
  name: string;
  size?: number;
  type?: string;
  status?: string;
}

export interface QueryResult {
  completion?: string;
  sources?: string[];
  error?: string;
}

export interface UploadResult {
  success?: boolean;
  fileName?: string;
  error?: string;
}