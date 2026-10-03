export type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface Detection {
  label: string;
  confidence: number;
  box: Box;
}

export interface DetectionResult {
  width: number;
  height: number;
  detections: Detection[];
}

export interface PhotoDoc {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  detections: Detection[];
  createdAt: Date;
}
