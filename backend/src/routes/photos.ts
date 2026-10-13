import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import path from "node:path";
import { unlink } from "node:fs/promises";
import crypto from "node:crypto";
import { detector } from "@/services/detector.ts";
import { db } from "@/database/database.ts";

export const router = express.Router();

const storage = multer.diskStorage({
  destination: Bun.env.UPLOAD_DIR ?? "uploads",
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

router.post("/", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Falta el archivo 'photo' o no es una imagen" });
    return;
  }

  try {
    const resultado = await detector.detectar(req.file.path);
    const foto = await db.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width: resultado.width,
      height: resultado.height,
      detections: resultado.detections,
    });
    res.status(201).json(foto);
  } catch (err) {
    console.error(err);
    await unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: "No se pudo procesar la foto" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const fotos = await db.list();
    res.json(fotos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron listar las fotos" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id)) {
    res.status(404).json({ error: "Foto no encontrada" });
    return;
  }

  try {
    const foto = await db.findById(id);
    if (!foto) {
      res.status(404).json({ error: "Foto no encontrada" });
      return;
    }
    res.json(foto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo obtener la foto" });
  }
});
