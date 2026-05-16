import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Issue } from '../../types';

const KEY = import.meta.env.VITE_MAPTILER_KEY as string;

const STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`;

const STATUS_COLORS: Record<string, string> = {
  submitted:    '#A0B0C8',
  acknowledged: 'rgb(214,158,46)',
  in_progress:  'rgb(96,165,209)',
  resolved:     'rgb(88,166,115)',
  rejected:     'rgb(196,80,72)',
};

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
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const markersRef   = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || !KEY) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: center ?? [90.4125, 23.8103], // default Dhaka
      zoom,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render markers when issues or picked change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function addMarkers() {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      issues.forEach((issue) => {
        const [lng, lat] = issue.location.coordinates;
        const color   = STATUS_COLORS[issue.status] ?? '#A0B0C8';
        const animate = ANIMATED.has(issue.status);
        const isPicked = picked === issue._id;

        const el = document.createElement('div');
        el.style.cssText = 'position:relative;width:22px;height:22px;cursor:pointer;';

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

        const dot = document.createElement('span');
        dot.style.cssText = `
          position:absolute;inset:30%;border-radius:50%;
          background:${color};
          box-shadow:0 0 0 2px #0D1424${isPicked ? `,0 0 0 4px ${color}` : ''};
          transition:box-shadow 0.15s;
        `;
        el.appendChild(dot);

        const popup = new maplibregl.Popup({ offset: 14, closeButton: false })
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;font-size:12px;color:#111;max-width:200px;line-height:1.4;">
              <strong>${issue.title}</strong><br/>
              <span style="font-size:10px;opacity:0.6;text-transform:uppercase;">${issue.category} · ${issue.status}</span><br/>
              <span style="font-size:11px;">${issue.address}</span>
            </div>
          `);

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map!);

        el.addEventListener('click', () => onPick?.(issue));
        markersRef.current.push(marker);
      });
    }

    if (map.loaded()) addMarkers();
    else map.once('load', addMarkers);
  }, [issues, picked, onPick]);

  if (!KEY) {
    return (
      <div style={{
        height,
        background: 'var(--ink-3)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--muted)',
      }}>
        <span>Map unavailable</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted-2)' }}>
          Add VITE_MAPTILER_KEY to frontend/.env
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height, borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--line-2)' }}
    />
  );
}
