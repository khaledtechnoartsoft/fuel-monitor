"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fixing Leaflet default icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for Statuses
const createStatusIcon = (color: string) => {
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    className: "custom-marker",
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });
};

const icons = {
  AVAILABLE: createStatusIcon("#22c55e"), // green-500
  NOT_AVAILABLE: createStatusIcon("#ef4444"), // red-500
  SUSPICIOUS: createStatusIcon("#eab308"), // yellow-500
};

interface MapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  reports?: any[];
}

export default function Map({ onLocationSelect, reports = [] }: MapProps) {
  const [position, setPosition] = useState<[number, number]>([23.7, 90.4]); // Default to Dhaka

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          console.warn("Geolocation denied, using default coordinates.");
        }
      );
    }
  }, []);

  function LocationPicker() {
    useMapEvents({
      click(e) {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports.map((report) => (
        <Marker 
          key={report.id} 
          position={[report.lat, report.lng]} 
          icon={icons[report.status as keyof typeof icons] || DefaultIcon}
        >
          <Popup>
            <div className="p-2 min-w-[150px]">
              <h3 className="font-bold text-lg">{report.locationName}</h3>
              <p className="text-sm font-medium" style={{ color: report.status === 'AVAILABLE' ? '#22c55e' : report.status === 'NOT_AVAILABLE' ? '#ef4444' : '#eab308' }}>
                {report.status.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
              <div className="mt-2 text-xs border-t pt-1 flex justify-between">
                <span>Votes: {report.votes?.length || 0}</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      <LocationPicker />
    </MapContainer>
  );
}
