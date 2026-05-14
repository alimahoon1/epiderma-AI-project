export enum Sender {
  User = 'user',
  Bot = 'bot'
}

export enum AcneSeverity {
  Mild = 'Mild',
  Moderate = 'Moderate',
  Severe = 'Severe',
  None = 'None'
}

// Normalized coordinates [ymin, xmin, ymax, xmax] on 0-1000 scale
export type BoundingBox = [number, number, number, number];

export interface Detection {
  label: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface AnalysisResult {
  severity: AcneSeverity;
  detections: Detection[];
  treatment_suggestions: string;
  disclaimer: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  image?: string; // Base64
  analysis?: AnalysisResult;
  isThinking?: boolean;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}