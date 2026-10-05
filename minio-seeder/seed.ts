// seed.ts
// import * as Minio from "minio";
import axios from "axios";

import { Client } from "minio";

const minioClient = new Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadminsecret",
});

const BUCKET_NAME = "harita-resimleri";

// Örnek olarak yüklenecek 5 farklı manzara resmi
const imageUrls = [
  "https://plus.unsplash.com/premium_photo-1711237006409-1c822187abb2?q=80&w=713&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1723708942734-2d8e02471e39?q=80&w=673&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1666529074384-c32558261697?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1769958029016-9b6eaf97c28f?q=80&w=1474&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1789900032449-f98b6940a3fd?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

async function seedMinio() {
  try {
    // 1. Bucket var mı kontrol et, yoksa oluştur
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`Bucket '${BUCKET_NAME}' başarıyla oluşturuldu.`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' zaten mevcut.`);
    }

    // 2. Resimleri internetten buffer olarak indirip MinIO'ya yükle
    for (let i = 0; i < imageUrls.length; i++) {
      const fileName = `image-${i + 1}.jpg`;
      console.log(`${fileName} indiriliyor...`);

      const response = await axios.get(imageUrls[i], {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");

      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        buffer,
        buffer.length,
        {
          "Content-Type": "image/jpeg",
        },
      );
      console.log(`✓ ${fileName} başarıyla MinIO'ya yüklendi.`);
    }
    console.log("Tohumlama işlemi başarıyla tamamlandı!");
  } catch (error) {
    console.error("Hata oluştu:", error);
  }
}

seedMinio();
