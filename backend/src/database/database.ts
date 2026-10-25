import mongoose, { Schema } from "mongoose";
import type { Box, Detection, PhotoDoc } from "@/types/types.ts";

const boxSchema = new Schema<Box>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const detectionSchema = new Schema<Detection>(
  {
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    box: { type: boxSchema, required: true },
  },
  {
    _id: false,
  },
);

const photoSchema = new Schema<PhotoDoc>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    detections: [detectionSchema],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

const Photo = mongoose.model<PhotoDoc>("Photo", photoSchema);

class Database {
  private static instance: Database;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(uri: string): Promise<void> {
    await mongoose.connect(uri);
  }

  async create(data: Omit<PhotoDoc, "createdAt">) {
    const res = await Photo.create(data);
    return res;
  }

  async list() {
    const res = await Photo.find().sort({ createdAt: -1 });
    return res;
  }

  async findById(id: string) {
    const res = await Photo.findById(id);
    return res;
  }

  async deleteById(id: string) {
    const res = await Photo.findByIdAndDelete(id);
    return res;
  }

  async deleteAll() {
    const fotos = await Photo.find().select("filename");
    await Photo.deleteMany({});
    return fotos;
  }
}

export const db = Database.getInstance();
