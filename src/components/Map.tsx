"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

// Fixing Leaflet default icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for Statuses (Vigilance Edition)
const createStatusIcon = (color: string, type: string = "PUMP", isVerified: boolean = false) => {
  const iconMarkup = type === "SHOP" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    : type === "WAREHOUSE"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7l8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22L15 22"/><path d="M4 9L15 9"/><path d="M14 22V4.5C14 3.7 14.7 3 15.5 3H18.5C19.3 3 20 3.7 20 4.5V22"/><path d="M18 7H20"/><path d="M18 11H20"/><path d="M10 22V15C10 13.9 9.1 13 8 13H5C3.9 13 3 13.9 3 15V22"/></svg>`;

  return new L.DivIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div style="background-color: ${color};" class="w-9 h-9 rounded-2xl border-2 border-white/50 shadow-2xl flex items-center justify-center text-white backdrop-blur-sm">
          ${iconMarkup}
        </div>
        ${isVerified ? `
          <div class="absolute -top-1 -right-1 bg-teal-500 rounded-full p-1 border-2 border-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        ` : ''}
      </div>
    `,
    className: "custom-marker-container",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const icons = {
  AVAILABLE: (t: string, v: boolean) => createStatusIcon("#14b8a6", t, v), // teal
  NOT_AVAILABLE: (t: string, v: boolean) => createStatusIcon("#64748b", t, v), // slate
  SUSPICIOUS: (t: string, v: boolean) => createStatusIcon("#f59e0b", t, v), // amber
  HOARDING: (t: string, v: boolean) => createStatusIcon("#ef4444", t, v), // red (corruption)
  OVERPRICED: (t: string, v: boolean) => createStatusIcon("#f97316", t, v), // orange
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
      
      {/* Syndicate Hotspots Layer (Justice Mode) */}
      {reports.filter(r => r.status === 'HOARDING' || r.status === 'OVERPRICED').map((report) => (
        <Circle
          key={`hotspot-${report.id}`}
          center={[report.lat, report.lng]}
          radius={500}
          pathOptions={{
            color: report.status === 'HOARDING' ? '#ef4444' : '#f97316',
            fillColor: report.status === 'HOARDING' ? '#ef4444' : '#f97316',
            fillOpacity: 0.1,
            dashArray: '5, 10',
            weight: 1
          }}
        >
          <Tooltip sticky direction="top" className="bg-red-600/90 text-white font-black border-none px-3 py-1 rounded-full shadow-2xl scale-75">
             <div className="flex items-center gap-1.5 uppercase tracking-tighter text-[9px]">
                <AlertTriangle className="h-2 w-2" />
                SYNDICATE ALERT
             </div>
          </Tooltip>
        </Circle>
      ))}

      {reports.map((report) => (
        <Marker 
          key={report.id} 
          position={[report.lat, report.lng]} 
          icon={(icons[report.status as keyof typeof icons] as any)?.(report.locationType, report.isVerified) || DefaultIcon}
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
