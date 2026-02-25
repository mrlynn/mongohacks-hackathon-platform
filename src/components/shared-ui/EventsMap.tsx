"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom MongoDB Green marker
const mongoGreenIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#00ED64" stroke="#00684A" stroke-width="1"
            d="M12.5,0 C5.6,0 0,5.6 0,12.5 C0,21.9 12.5,41 12.5,41 S25,21.9 25,12.5 C25,5.6 19.4,0 12.5,0 Z"/>
      <circle fill="#00684A" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

interface Event {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  coordinates: [number, number];
  venue?: string;
  startDate: string;
  endDate: string;
  isVirtual: boolean;
  status: string;
}

interface EventsMapProps {
  events: Event[];
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function EventsMap({
  events,
  center = [20, 0],
  zoom = 2,
}: EventsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height: "600px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "600px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={true}
    >
      <MapUpdater center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((event) => {
        const [lng, lat] = event.coordinates;
        return (
          <Marker key={event._id} position={[lat, lng]} icon={mongoGreenIcon}>
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}>
                  {event.name}
                </h3>
                {event.venue && (
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    📍 {event.venue}
                  </p>
                )}
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  🌍 {event.city}, {event.country}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  📅 {new Date(event.startDate).toLocaleDateString()}
                </p>
                {event.isVirtual && (
                  <span style={{ 
                    display: "inline-block", 
                    padding: "2px 8px", 
                    background: "#0068F9", 
                    color: "white", 
                    borderRadius: "4px", 
                    fontSize: "12px", 
                    marginTop: "8px"
                  }}>
                    Virtual
                  </span>
                )}
                <a
                  href={`/events/${event._id}`}
                  style={{ 
                    display: "block", 
                    marginTop: "8px", 
                    color: "#00ED64", 
                    textDecoration: "none", 
                    fontWeight: 500 
                  }}
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
