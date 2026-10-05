# 🗺️ React + TypeScript + Node.js (Vite) & MinIO Harita Entegrasyonu

Bu proje, Ege Bölgesi'ndeki 5 farklı statik konuma (İzmir, Muğla, Aydın, Manisa, Denizli) ait harita marker'larına (pinlerine) tıklandığında, **MinIO S3 Nesne Depolama** sunucusundan güvenli ve geçici erişim bağlantıları (**Presigned URL**) üreterek harita arayüzünde canlı görsel sergileyen tam teşekküllü bir **Monorepo** uygulamasıdır.

## 🚀 Proje Mimarisi & Özellikleri

- **Güvenlik Odaklı Tasarım:** MinIO `accessKey` ve `secretKey` bilgileri client (React) tarafında asla barındırılmaz. Tüm S3 entegrasyonu backend (Node.js) soyutlaması üzerinden yürütülür.
- **Node.js v22+ Uyumluluğu:** `ts-node` kütüphanesinin TypeScript 7+ ile yaşadığı uyumsuzluklar elenerek, modern ve hızlı `tsx` (TypeScript Execute) mimarisi kullanılmıştır.
- **Performans:** Görseller tarayıcıya doğrudan açık (public) bırakılmak yerine, backend tarafından üretilen 1 saat geçerli geçici token'lı bağlantılarla beslenir.

---

## 🛠️ Klasör Yapısı

```text
├── backend/          # Node.js + Express + TypeScript Sunucusu
├── frontend/         # React + TypeScript + Leaflet Harita Ön Yüzü
└── minio-seeder/     # MinIO veritabanını otomatik dolduran tohumlama scripti
```

---

## 📌 Adım Adım Kurulum ve Çalıştırma

### Adım 1: Docker ile MinIO Sunucusunu Kaldırma

İlk olarak yerel bilgisayarınızda bir MinIO konteynerini ayağa kaldırın. Port `9000` API erişimi, port `9001` ise web yönetim paneli (Console) içindir.

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name harita-minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadminsecret" \
  alpine/minio server /data --console-address ":9001"
```

*Not: Tarayıcınızdan `http://localhost:9001` adresine giderek kullanıcı adı: `minioadmin`, şifre: `minioadminsecret` ile yönetim paneline giriş yapabilirsiniz.*

---

### Adım 2: MinIO'ya İlk Verileri Yükleme (Seeder)

Sistemde otomatik olarak `harita-resimleri` adında bir bucket oluşturmak ve internetten test amaçlı 5 manzara fotoğrafını indirip MinIO'ya aktarmak için tohumlama scriptini çalıştırın.

```bash
cd minio-seeder
npm install
node --experimental-strip-types seed.ts
```

*Script tamamlandığında terminalinizde `✓ resim-X.jpg başarıyla MinIO'ya yüklendi.` çıktılarını görmelisiniz.*

---

### Adım 3: Arka Yüz (Backend) Sunucusunu Başlatma

Backend katmanı, haritadaki pinlerden gelen isteklere göre MinIO'dan güvenli URL üretir.

```bash
cd ../backend
npm install
npm run dev
```

Sunucu başarıyla **`http://localhost:5001`** portunda çalışmaya başlayacaktır.

---

### Adım 4: Ön Yüz (Frontend) Uygulamasını Başlatma

React Leaflet haritasını ve interaktif paneli içeren kullanıcı arayüzünü ayağa kaldırın.

```bash
cd ../frontend
npm install
npm run dev
```

Terminalde verilen local adresi (Genellikle **`http://localhost:5173`**) tarayıcınızda açın.

---

## ⚙️ Yapılandırma ve Önemli Kod Blokları

### MinIO İstemci Bağlantısı (Named Import)

TypeScript derleme hatalarını önlemek adına, MinIO bağlantısı `minio` SDK'sından doğrudan `{ Client }` prototipi import edilerek gerçekleştirilmiştir:

```typescript
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadminsecret',
});
```

### Yapılandırılan Statik Ege Bölgesi Koordinatları

Uygulama kapsamında harita üzerinde listelenen koordinatlar ve MinIO nesne eşleşmeleri aşağıda tanımlanmıştır:

| İl / Bölge | Koordinat (Lat, Lng) | MinIO Dosya Adı |
| :--- | :--- | :--- |
| **İzmir (Kordon)** | `38.4237, 27.1428` | `resim-1.jpg` |
| **Muğla (Bodrum)** | `37.0344, 27.4305` | `resim-2.jpg` |
| **Aydın (Merkez)** | `37.8480, 27.8451` | `resim-3.jpg` |
| **Manisa (Spil Dağı)** | `38.6140, 27.4296` | `resim-4.jpg` |
| **Denizli (Pamukkale)** | `37.7743, 29.0875` | `resim-5.jpg` |

---

## 🛠️ Olası Sorunlar ve Çözümleri

#### 1. Haritadaki pinler (marker) görünmüyor veya kırık link hatası veriyor?

Leaflet kütüphanesinin CSS yapılandırması ya da varsayılan ikon pikselleri eksik olduğunda harita kayabilir. Projede bu durum `App.tsx` içerisinde standart boyutlar atanarak çözülmüştür:

```typescript
iconSize:,
iconAnchor:,
```

#### 2. `TypeError: Cannot read properties of undefined (reading 'fileExists')` hatası nedir?

TypeScript 7+ sürümünün compiler API'sindeki köklü değişiklikler nedeniyle eski `ts-node` kütüphanesi çökmektedir. Projede bu durum, backend tarafında **`tsx watch`** mimarisine, seeder tarafında ise Node.js'in yerleşik **`--experimental-strip-types`** özelliğine geçilerek tamamen aşılmıştır.
