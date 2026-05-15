import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Issue } from '../../types';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

const statusColors: Record<string, string> = {
  submitted:    '#94A3BC',
  acknowledged: 'oklch(0.78 0.16 65)',
  in_progress:  'oklch(0.74 0.10 230)',
  resolved:     'oklch(0.70 0.13 152)',
  rejected:     'oklch(0.66 0.21 25)',
};

// Active statuses get animated rings
const ANIMATED = new Set(['acknowledged', 'in_progress']);

interface Props {
  issues: Issue[];
  height?: number | string;
  onPick?: (issue: Issue) => void;
  picked?: string | null;
  center?: [number, number];
  zoom?: number;
}

export function PulseMap({ issues, height = 500, onPick, picked, center, zoom = 12 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const markersRef   = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const defaultCenter: [number, number] = center ?? [90.4125, 23.8103]; // Dhaka

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: defaultCenter,
      zoom,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render markers when issues change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      issues.forEach((issue) => {
        const [lng, lat] = issue.location.coordinates;
        const color = statusColors[issue.status] ?? '#94A3BC';
        const animate = ANIMATED.has(issue.status);

        const el = document.createElement('div');
        el.style.cssText = `position:relative;width:20px;height:20px;cursor:pointer;`;

        // Pulse rings for active statuses
        if (animate) {
          [0, 0.9, 1.8].forEach((delay) => {
            const ring = document.createElement('span');
            ring.style.cssText = `
              position:absolute;inset:0;border-radius:50%;
              border:1.5px solid ${color};
              animation:pulse-ring 2.6s ease-out ${delay}s infinite;
              opacity:0;
            `;
            el.appendChild(ring);
          });
        }

        const pin = document.createElement('span');
        pin.style.cssText = `
          position:absolute;inset:30%;border-radius:50%;
          background:${color};
          box-shadow:0 0 0 2px var(--ink);
          ${picked === issue._id ? 'box-shadow:0 0 0 3px var(--pulse),0 0 0 5px var(--ink);' : ''}
        `;
        el.appendChild(pin);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`
            <div style="font-family:var(--font-sans);font-size:12px;color:#0B1220;max-width:200px;">
              <strong>${issue.title}</strong><br/>
              <span style="font-family:monospace;font-size:10px;opacity:0.6;">${issue.category} · ${issue.status}</span><br/>
              <span style="font-size:11px;">${issue.address}</span>
            </div>
          `))
          .addTo(map);

        el.addEventListener('click', () => onPick?.(issue));
        markersRef.current.push(marker);
      });
    };

    if (map.loaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }
  }, [issues, picked, onPick]);

  if (!TOKEN) {
    return (
      <div style={{
        height,
        background: 'var(--ink-3)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--muted)',
        flexDirection: 'column',
        gap: 8,
      }}>
        <span>Map unavailable</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted-2)' }}>
          Add VITE_MAPBOX_TOKEN to frontend/.env
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '1px solid var(--line-2)',
      }}
    />
  );
}
