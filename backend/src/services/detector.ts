import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import type { DetectionResult } from "@/types/types.ts";

const rutaPython = path.resolve("python/.venv/bin/python");
const rutaScript = path.resolve("python/detect.py");

type Pendiente = {
  resolve: (r: DetectionResult) => void;
  reject: (e: Error) => void;
};

class Detector {
  private proceso: ChildProcessWithoutNullStreams | null = null;
  private listo: Promise<void> | null = null;
  private cola: Pendiente[] = [];

  iniciar(): Promise<void> {
    if (this.listo) return this.listo;

    this.listo = new Promise((resolve, reject) => {
      const proceso = spawn(rutaPython, [rutaScript]);
      this.proceso = proceso;
      let errores = "";

      proceso.stderr.on("data", (chunk) => {
        errores += chunk.toString();
      });

      proceso.on("error", (err) => {
        reject(new Error(`No se pudo ejecutar Python: ${err.message}`));
      });

      proceso.on("close", (codigo) => {
        const error = new Error(`Python terminó con código ${codigo}:\n${errores}`);
        reject(error);
        for (const p of this.cola) p.reject(error);
        this.cola = [];
        this.proceso = null;
        this.listo = null;
      });

      const lineas = readline.createInterface({ input: proceso.stdout });

      lineas.on("line", (linea) => {
        let datos: unknown;
        try {
          datos = JSON.parse(linea);
        } catch {
          return;
        }

        if (typeof datos === "object" && datos !== null && "ready" in datos) {
          resolve();
          return;
        }

        const pendiente = this.cola.shift();
        if (!pendiente) return;

        if (typeof datos === "object" && datos !== null && "error" in datos) {
          pendiente.reject(new Error(`Python falló: ${(datos as { error: string }).error}`));
          return;
        }

        pendiente.resolve(datos as DetectionResult);
      });
    });

    return this.listo;
  }

  async detectar(imagePath: string): Promise<DetectionResult> {
    await this.iniciar();
    const proceso = this.proceso;
    if (!proceso) throw new Error("El detector no está corriendo");

    return new Promise((resolve, reject) => {
      this.cola.push({ resolve, reject });
      proceso.stdin.write(path.resolve(imagePath) + "\n");
    });
  }

  detener(): void {
    this.proceso?.kill();
  }
}

export const detector = new Detector();
