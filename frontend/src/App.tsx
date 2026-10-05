// src/App.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Harita pin ikonu ayarları (Leaflet varsayılan CDN adresleri)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com",
  iconRetinaUrl: "https://unpkg.com",
  shadowUrl: "https://unpkg.com",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  title: string;
  fileName: string;
}

const App: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/markers")
      .then((res) => res.json())
      .then((data: MarkerData[]) => setMarkers(data))
      .catch((err) => console.error("Ege marker yükleme hatası:", err));
  }, []);

  const handleMarkerClick = async (fileName: string) => {
    setLoadingImage(true);
    setSelectedImageUrl(null);
    try {
      const response = await fetch(
        `http://localhost:5001/api/tiles/${fileName}`,
      );
      if (!response.ok) throw new Error("Görsel getirilemedi");
      const data = (await response.json()) as { url: string };
      setSelectedImageUrl(data.url);
    } catch (error) {
      console.error("MinIO görseli getirilirken hata oluştu:", error);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        fontFamily: "sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sol Panel: Ege Odaklı Harita */}
      <div style={{ width: "65%", height: "100%" }}>
        {/* center parametresi İzmir koordinatlarına, zoom ise bölgeyi görecek şekilde 8'e ayarlandı */}
        <MapContainer
          center={[38.4237, 27.1428]}
          zoom={8}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              eventHandlers={{
                click: () => handleMarkerClick(marker.fileName),
              }}
            >
              <Popup>
                <strong>{marker.title}</strong> <br />
                MinIO görseli için pini tıkladınız.
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sağ Panel: Görsel Alanı */}
      <div
        style={{
          width: "35%",
          padding: "20px",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>Ege Bölgesi MinIO Vitrini</h3>
        <p
          style={{
            color: "#666",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Ege'deki pinlere tıklayarak MinIO sunucusundaki harita tile/görsel
          verilerini canlı izleyin.
        </p>

        <div
          style={{
            width: "100%",
            height: "350px",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: "#fafafa",
          }}
        >
          {loadingImage && (
            <p style={{ color: "#555" }}>
              MinIO'dan güvenli veri akışı sağlanıyor...
            </p>
          )}

          {!loadingImage && selectedImageUrl && (
            <img
              src={selectedImageUrl}
              alt="MinIO Ege Görseli"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          {!loadingImage && !selectedImageUrl && (
            <p style={{ color: "#aaa" }}>
              Lütfen haritadan bir Ege pini seçin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
