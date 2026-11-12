import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DemoMapProfile {
  id: string;
  display_name: string;
  municipality: string;
  consultation_modes: readonly string[];
  geo: {
    latitude: number;
    longitude: number;
    synthetic: boolean;
    approximate: boolean;
    kind: string;
  };
}

interface Props {
  profiles: readonly DemoMapProfile[];
  onSelect: (id: string) => void;
}

/**
 * Browser-only map with approximate synthetic markers.
 * No location permission, geocoder, credentials, personal addresses or tracking.
 * OSM standard raster tiles are for low-volume POC use; replace tile provider at scale.
 */
export function LawyerMap({ profiles, onSelect }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const callbackRef = useRef(onSelect);

  useEffect(() => { callbackRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || mapRef.current) return;
    const map = L.map(element, { scrollWheelZoom: false, zoomControl: true, maxZoom: 14 }).setView([19.415, -99.17], 10);
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    // Leaflet must be destroyed before the component is unmounted (React StrictMode safe).
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const bounds: L.LatLngExpression[] = [];
    profiles.forEach(profile => {
      if (!profile.geo?.synthetic) return;
      const position: L.LatLngExpression = [profile.geo.latitude, profile.geo.longitude];
      bounds.push(position);
      const remoteOnly = !profile.consultation_modes.includes("presencial");
      const marker = L.circleMarker(position, {
        radius: 10,
        color: remoteOnly ? "#245e77" : "#9e773c",
        fillColor: remoteOnly ? "#4b92ae" : "#d3a35d",
        fillOpacity: .85,
        weight: 2
      });
      const popup = document.createElement("div");
      popup.className = "lawyer-map-popup";
      const title = document.createElement("strong");
      title.textContent = profile.display_name;
      const label = document.createElement("p");
      label.textContent = (remoteOnly ? "Área de atención por videollamada" : "Zona ilustrativa de despacho") + " · " + profile.municipality;
      const warning = document.createElement("small");
      warning.textContent = "PUNTO FICTICIO · NO ES UNA DIRECCIÓN REAL";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Ver ficha de prueba";
      button.addEventListener("click", () => callbackRef.current(profile.id));
      popup.append(title, label, warning, button);
      marker.bindPopup(popup).addTo(layer);
    });
    if (bounds.length) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [30,30], maxZoom: 12 });
    } else {
      map.setView([19.415, -99.17], 10);
    }
    // Resize after grid/list view becomes visible.
    map.invalidateSize();
  }, [profiles]);

  return <div className="lawyer-map-wrap">
    <div className="lawyer-map-caution" role="note">Mapa ilustrativo: los marcadores muestran zonas ficticias, no ubicaciones de profesionales reales. Azul = atención remota; dorado = posible atención presencial de prueba.</div>
    <div ref={elementRef} className="lawyer-leaflet-map" role="region" aria-label="Mapa de ubicaciones ficticias de abogados"/>
    <p className="lawyer-map-footnote">Mapa © OpenStreetMap contributors. Sin API key en esta POC. Usa los controles +/− para explorar; desplaza la página normalmente.</p>
  </div>;
}
