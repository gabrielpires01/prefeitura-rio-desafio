"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import { Child } from '@/types';

const favelaCoords: Record<string, [number, number]> = {
  "Rocinha": [-22.9886, -43.2483],
  "Maré": [-22.8615, -43.2415],
  "Jacarezinho": [-22.8856, -43.2589],
  "Complexo do Alemão": [-22.8631, -43.2755],
  "Mangueira": [-22.9038, -43.2372]
};

export default function Map({ data }: { data: Child[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayerInstance = useRef<L.HeatLayer | null>(null);
  
  const [hasDimensions, setHasDimensions] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setHasDimensions(true);
        observer.disconnect();
      }
    });

    observer.observe(mapContainer.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasDimensions || !mapContainer.current || !data) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current).setView([-22.9468, -43.2000], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(mapInstance.current);
    }

    if (heatLayerInstance.current) {
      mapInstance.current.removeLayer(heatLayerInstance.current);
    }

    const heatData: [number, number, number][] = data.map(person => {
      const coords = favelaCoords[person.bairro];
      if (!coords) return null;

      let alertCount = 0;
      if (person.saude?.alertas) alertCount += person.saude.alertas.length;
      if (person.educacao?.alertas) alertCount += person.educacao.alertas.length;
      if (person.assistencia_social?.alertas) alertCount += person.assistencia_social.alertas.length;
      
      const intensity = 0.5 + (alertCount * 0.5);
      const jitterLat = (Math.random() - 0.5) * 0.015;
      const jitterLng = (Math.random() - 0.5) * 0.015;

      return [coords[0] + jitterLat, coords[1] + jitterLng, intensity] as [number, number, number];
    }).filter((item): item is [number, number, number] => item !== null);

    const size = mapInstance.current.getSize();
    if (size.x === 0 || size.y === 0) return;

    heatLayerInstance.current = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 13,
      max: 3.0,
      gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
    }).addTo(mapInstance.current);

    return () => {};
  }, [data, hasDimensions]); 

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
          Densidade de Alertas
        </h4>
        <div style={{
          height: '12px',
          width: '100%',
          background: 'linear-gradient(to right, blue, cyan, lime, yellow, red)',
          borderRadius: '4px',
          marginBottom: '4px'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '12px' }}>
          <span>Baixa</span>
          <span>Crítica</span>
        </div>
      </div>
    </div>
  );
}
