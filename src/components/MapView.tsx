import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NAGPUR_CENTER } from '../data/constants';
import type { Post } from '../types';

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColors: Record<string, string> = {
  'Road Damage': '#ea580c',
  Streetlight: '#eab308',
  'Water Supply': '#3b82f6',
  Garbage: '#22c55e',
  Drainage: '#06b6d4',
  Traffic: '#ef4444',
  'Public Transport': '#8b5cf6',
  Footpath: '#f97316',
  Electricity: '#f59e0b',
  Other: '#6b7280',
};

function createDivIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

interface MapViewProps {
  posts?: Post[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (post: Post) => void;
  selectedPostId?: string;
  pickable?: boolean;
  onPick?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  filter?: string;
}

export function MapView({
  posts = [],
  center = NAGPUR_CENTER,
  zoom = 12,
  height = '400px',
  onMarkerClick,
  selectedPostId,
  pickable = false,
  onPick,
  pickedLocation,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when posts change
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    posts.forEach((post) => {
      if (post.lat == null || post.lng == null) return;
      const color = post.status === 'Resolved' ? '#22c55e' : categoryColors[post.category || 'Other'] || '#ea580c';
      const marker = L.marker([post.lat, post.lng], { icon: createDivIcon(color, post.title) });
      marker.bindPopup(
        `<div style="min-width:180px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;color:#1f2937;">${post.title}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${post.category || post.type} &middot; ${post.locality}</div>
          <div style="font-size:11px;color:#6b7280;">Status: <strong>${post.status}</strong></div>
        </div>`
      );
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(post));
      }
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [posts, onMarkerClick]);

  // Highlight selected post
  useEffect(() => {
    if (!mapRef.current || !selectedPostId) return;
    const post = posts.find((p) => p.id === selectedPostId);
    if (post && post.lat != null && post.lng != null) {
      mapRef.current.flyTo([post.lat, post.lng], 15, { duration: 0.5 });
    }
  }, [selectedPostId, posts]);

  // Pickable mode
  useEffect(() => {
    if (!mapRef.current) return;
    if (pickable) {
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onPick?.(e.latlng.lat, e.latlng.lng);
      });
    } else {
      mapRef.current.off('click');
    }
  }, [pickable, onPick]);

  // Show picked location
  useEffect(() => {
    if (!mapRef.current) return;
    if (pickMarkerRef.current) {
      pickMarkerRef.current.remove();
      pickMarkerRef.current = null;
    }
    if (pickedLocation) {
      const icon = L.divIcon({
        className: 'pick-marker',
        html: `<div style="background:#ea580c;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">+</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      pickMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], { icon }).addTo(mapRef.current);
      mapRef.current.flyTo([pickedLocation.lat, pickedLocation.lng], 15, { duration: 0.5 });
    }
  }, [pickedLocation]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="z-0" />;
}
