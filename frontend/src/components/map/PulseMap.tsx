import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Locate, LoaderCircle } from 'lucide-react';
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
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<maplibregl.Map | null>(null);
  const markersRef    = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [locating, setLocating]   = useState(false);
  const [locError, setLocError]   = useState('');

  // Init map
  useEffect(() => {
    if (!containerRef.current || !KEY) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: center ?? [90.4125, 23.8103],
      zoom,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render issue markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function addMarkers() {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      issues.forEach((issue) => {
        const [lng, lat] = issue.location.coordinates;
        const color    = STATUS_COLORS[issue.status] ?? '#A0B0C8';
        const animate  = ANIMATED.has(issue.status);
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
          box-shadow:0 0 0 2px #0E1726${isPicked ? `,0 0 0 4px ${color}` : ''};
          transition:box-shadow 0.15s;
        `;
        el.appendChild(dot);

        const popup = new maplibregl.Popup({ offset: 14, closeButton: false })
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;font-size:12px;color:#111;max-width:200px;line-height:1.5;">
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

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude: lng, latitude: lat } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        // Remove previous user marker
        userMarkerRef.current?.remove();

        // Blue pulsing dot for user location
        const el = document.createElement('div');
        el.style.cssText = 'position:relative;width:20px;height:20px;';

        const ring = document.createElement('span');
        ring.style.cssText = `
          position:absolute;inset:0;border-radius:50%;
          border:2px solid rgb(96,165,250);
          animation:pulse-ring 2s ease-out 0s infinite;
          opacity:0;
        `;
        el.appendChild(ring);

        const ring2 = document.createElement('span');
        ring2.style.cssText = `
          position:absolute;inset:0;border-radius:50%;
          border:2px solid rgb(96,165,250);
          animation:pulse-ring 2s ease-out 0.7s infinite;
          opacity:0;
        `;
        el.appendChild(ring2);

        const dot = document.createElement('span');
        dot.style.cssText = `
          position:absolute;inset:20%;border-radius:50%;
          background:rgb(96,165,250);
          box-shadow:0 0 0 3px #0E1726, 0 0 12px rgb(96,165,250);
        `;
        el.appendChild(dot);

        const userMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(
            new maplibregl.Popup({ offset: 14, closeButton: false })
              .setHTML('<div style="font-family:system-ui,sans-serif;font-size:12px;color:#111;padding:2px 4px;">📍 You are here</div>')
          )
          .addTo(map);

        userMarkerRef.current = userMarker;

        map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.4, curve: 1.4 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError('Location access denied. Please allow location in your browser.');
        else if (err.code === 2) setLocError('Location unavailable. Try again.');
        else setLocError('Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  if (!KEY) {
    return (
      <div style={{
        height,
        background: 'var(--ink-3)',
        border: '1px solid var(--line-2)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 8,
        fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--muted)',
      }}>
        <span>Map unavailable</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted-2)' }}>
          Add VITE_MAPTILER_KEY to frontend/.env
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line-2)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Locate Me button */}
      <button
        onClick={handleLocate}
        disabled={locating}
        title="Go to my location"
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: locating ? 'var(--ink-2)' : 'var(--pulse)',
          color: locating ? 'var(--muted)' : '#0E1726',
          border: 'none',
          borderRadius: 8,
          padding: '9px 14px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '0.82rem',
          cursor: locating ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        {locating
          ? <LoaderCircle size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : <Locate size={14} />
        }
        {locating ? 'Locating…' : 'My location'}
      </button>

      {/* Error toast */}
      {locError && (
        <div style={{
          position: 'absolute',
          bottom: 56,
          left: 16,
          zIndex: 10,
          background: 'var(--alert)',
          color: '#fff',
          borderRadius: 6,
          padding: '8px 14px',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.78rem',
          maxWidth: 280,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {locError}
          <button
            onClick={() => setLocError('')}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
