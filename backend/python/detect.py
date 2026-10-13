import json
import sys
from pathlib import Path

from ultralytics import YOLO

ruta_pesos = Path(__file__).parent / "yolov8n-face.pt"
modelo = YOLO(ruta_pesos)


def detectar(ruta_imagen):
    resultado = modelo(ruta_imagen, verbose=False)[0]
    alto, ancho = resultado.orig_shape

    detecciones = []
    for caja in resultado.boxes:
        x1, y1, x2, y2 = caja.xyxy[0].tolist()
        detecciones.append(
            {
                "label": resultado.names[int(caja.cls[0])],
                "confidence": float(caja.conf[0]),
                "box": {
                    "x": round(x1),
                    "y": round(y1),
                    "width": round(x2 - x1),
                    "height": round(y2 - y1),
                },
            }
        )

    return {"width": ancho, "height": alto, "detections": detecciones}


def responder(obj):
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


if len(sys.argv) > 1:
    responder(detectar(sys.argv[1]))
    sys.exit(0)

responder({"ready": True})

for linea in sys.stdin:
    ruta = linea.strip()
    if not ruta:
        continue
    try:
        responder(detectar(ruta))
    except Exception as e:
        responder({"error": str(e)})
