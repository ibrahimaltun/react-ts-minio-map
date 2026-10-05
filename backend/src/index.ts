// src/index.ts
import express, { Request, Response } from "express";
import * as Minio from "minio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadminsecret",
});

const BUCKET_NAME = "harita-resimleri";

interface MarkerItem {
  id: number;
  lat: number;
  lng: number;
  title: string;
  fileName: string;
}

const egeMarkers: MarkerItem[] = [
  {
    id: 1,
    lat: 38.4237,
    lng: 27.1428,
    title: "İzmir (Kordon)",
    fileName: "image-1.jpg",
  },
  {
    id: 2,
    lat: 37.0344,
    lng: 27.4305,
    title: "Muğla (Bodrum)",
    fileName: "image-2.jpg",
  },
  {
    id: 3,
    lat: 37.848,
    lng: 27.8451,
    title: "Aydın (Merkez)",
    fileName: "image-3.jpg",
  },
  {
    id: 4,
    lat: 38.614,
    lng: 27.4296,
    title: "Manisa (Spil Dağı)",
    fileName: "image-4.jpg",
  },
  {
    id: 5,
    lat: 37.7743,
    lng: 29.0875,
    title: "Denizli (Pamukkale)",
    fileName: "image-5.jpg",
  },
];

app.get("/api/markers", (_req: Request, res: Response) => {
  res.json(egeMarkers);
});

app.get("/api/tiles/:fileName", async (req: Request, res: Response) => {
  const { fileName } = req.params;
  try {
    const presignedUrl = await minioClient.presignedGetObject(
      BUCKET_NAME,
      fileName,
      60 * 60,
    );
    res.json({ url: presignedUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen hata";
    res
      .status(500)
      .json({ error: "MinIO bağlantı hatası", details: errorMessage });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
});
