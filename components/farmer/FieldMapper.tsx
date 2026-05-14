'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface FieldMapperProps {
  onFieldDrawn: (fieldData: {
    coordinates: { lat: number; lng: number }[];
    areaHectares: number;
    centerLat: number;
    centerLng: number;
  }) => void;
}

// Inner component that uses map hooks
function MapInner({ onFieldDrawn }: FieldMapperProps) {
  const map = useMap();
  const drawingLib = useMapsLibrary('drawing');
  const geometryLib = useMapsLibrary('geometry');
  
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  // Initialize Drawing Manager when library is loaded
  useCallback(() => {
    if (!drawingLib || !map || drawingManager) return;

    const dm = new drawingLib.DrawingManager({
      drawingMode: drawingLib.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [drawingLib.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#22c55e',
        fillOpacity: 0.25,
        strokeWeight: 2,
        strokeColor: '#16a34a',
        clickable: true,
        editable: true,
      },
    });

    dm.setMap(map);
    setDrawingManager(dm);

    google.maps.event.addListener(dm, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const coordinates: { lat: number; lng: number }[] = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      // Calculate area and center using geometry library if available
      let areaHectares = 0;
      let centerLat = coordinates[0]?.lat || 0;
      let centerLng = coordinates[0]?.lng || 0;

      if (geometryLib) {
        const areaM2 = geometryLib.spherical.computeArea(path);
        areaHectares = parseFloat((areaM2 / 10000).toFixed(3));
      }

      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(c => bounds.extend(c));
      const center = bounds.getCenter();
      centerLat = center.lat();
      centerLng = center.lng();

      onFieldDrawn({
        coordinates,
        areaHectares,
        centerLat,
        centerLng,
      });

      dm.setDrawingMode(null); // Stop drawing mode
    });

  }, [drawingLib, map, drawingManager, geometryLib, onFieldDrawn]);

  // A simple hack to trigger the effect
  if (drawingLib && map && geometryLib && !drawingManager) {
    const dm = new drawingLib.DrawingManager({
      drawingMode: drawingLib.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [drawingLib.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#22c55e',
        fillOpacity: 0.25,
        strokeWeight: 2,
        strokeColor: '#16a34a',
        clickable: true,
        editable: true,
      },
    });

    dm.setMap(map);
    setDrawingManager(dm);

    google.maps.event.addListener(dm, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const coordinates: { lat: number; lng: number }[] = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      let areaHectares = 0;
      if (geometryLib) {
        const areaM2 = geometryLib.spherical.computeArea(path);
        areaHectares = parseFloat((areaM2 / 10000).toFixed(3));
      }

      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(c => bounds.extend(c));
      const center = bounds.getCenter();

      onFieldDrawn({
        coordinates,
        areaHectares,
        centerLat: center.lat(),
        centerLng: center.lng(),
      });

      dm.setDrawingMode(null);
    });
  }

  return null;
}

export function FieldMapper({ onFieldDrawn }: FieldMapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: 23.2599, lng: 77.4126 }); // Default: Bhopal

  // Try to get the user's current physical location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation failed or denied, using default fallback location.", error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  if (!apiKey) {
    return (
      <div style={{ width: '100%', height: '450px', borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center', border: '2px dashed #cbd5e1' }}>
        <span style={{ fontSize: '2rem' }}>🗺️</span>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Map Unavailable</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to enable drawing fields.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ width: '100%', height: '450px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <Map
          center={center}
          onCenterChanged={(ev) => setCenter(ev.detail.center)}
          defaultZoom={15}
          mapTypeId="satellite"
          disableDefaultUI={false}
          gestureHandling={'greedy'}
        >
          <MapInner onFieldDrawn={onFieldDrawn} />
        </Map>
      </div>
    </APIProvider>
  );
}
