import express from "express";
import path from "node:path";
import { router } from "@/routes/photos.ts";
import { db } from "@/database/database.ts";
import { detector } from "@/services/detector.ts";

const puerto = Number(Bun.env.PORT ?? 3000);
const mongoUri = Bun.env.MONGO_URI;
const uploadDir = Bun.env.UPLOAD_DIR ?? "uploads";
const frontendDist = path.resolve("../frontend/dist");

if (!mongoUri) {
  console.error("Falta MONGO_URI en el .env");
  process.exit(1);
}

await db.connect(mongoUri);
console.log("Conectado a MongoDB");

await detector.iniciar();
console.log("Modelo YOLO cargado");

const app = express();

app.use("/api/photos", router);

app.get("/api/health", (_req, res) => {
  res.send("OK");
});

app.use("/uploads", express.static(uploadDir));
app.use(express.static(frontendDist, { extensions: ["html"] }));

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});

process.on("SIGINT", () => {
  detector.detener();
  process.exit(0);
});
