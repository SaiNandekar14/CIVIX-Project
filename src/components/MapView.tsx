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

function createDivIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 22 : 14;
  const border = selected ? 4 : 2;
  const ringClass = selected ? 'box-shadow:0 0 0 4px rgba(234,88,12,0.3);' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:${border}px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);${ringClass}"></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
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
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pickMarkerRef = useRef<L.Marker | null>(null);
  const selectedPostIdRef = useRef<string | undefined>(selectedPostId);
  selectedPostIdRef.current = selectedPostId;

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // Fix tile rendering issues on resize or when container becomes visible
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when posts change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers not in new posts
    const newPostIds = new Set(posts.map((p) => p.id));
    markersRef.current.forEach((marker, postId) => {
      if (!newPostIds.has(postId)) {
        marker.remove();
        markersRef.current.delete(postId);
      }
    });

    // Add or update markers for current posts
    const seenCoords = new Set<string>();
    posts.forEach((post) => {
      if (post.lat == null || post.lng == null) return;
      const coordKey = `${post.lat.toFixed(6)},${post.lng.toFixed(6)}`;
      seenCoords.add(coordKey);

      const color = post.status === 'Resolved' ? '#22c55e' : categoryColors[post.category || 'Other'] || '#ea580c';
      const isSelected = selectedPostIdRef.current === post.id;
      const existing = markersRef.current.get(post.id);

      if (existing) {
        existing.setIcon(createDivIcon(color, isSelected));
      } else {
        const marker = L.marker([post.lat, post.lng], { icon: createDivIcon(color, false) });
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
        markersRef.current.set(post.id, marker);
      }
    });
  }, [posts, onMarkerClick]);

  // Highlight selected post — update icon sizes and fly to location
  useEffect(() => {
    if (!mapRef.current) return;

    // Update all marker icons to reflect selected state
    markersRef.current.forEach((marker, postId) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const color = post.status === 'Resolved' ? '#22c55e' : categoryColors[post.category || 'Other'] || '#ea580c';
      const isSelected = postId === selectedPostId;
      marker.setIcon(createDivIcon(color, isSelected));
    });

    // Fly to selected post
    if (selectedPostId) {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post && post.lat != null && post.lng != null) {
        mapRef.current.flyTo([post.lat, post.lng], 15, { duration: 0.5 });
      }
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
