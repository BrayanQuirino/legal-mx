import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed, MapPin, RotateCcw, SlidersHorizontal } from "lucide-react";
import { distanceKm, isWithinRadius, MAP_CENTERS, type Coordinates } from "./lib/geo";
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
const DEFAULT_CENTER: Coordinates = MAP_CENTERS.cdmx;
const DEFAULT_RADIUS_KM = 20;

/**
 * Synthetic demonstration only. Radius filters the geographic coordinates in local JSON.
 * Never request visitor geolocation. No professional verification or physical addresses.
 */
export function LawyerMap({ profiles, onSelect }: Props) {
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(onSelect);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  const nearbyProfiles = useMemo(() => profiles.filter(profile =>
    profile.geo?.synthetic && isWithinRadius(profile.geo, center, radiusKm)
  ), [profiles, center, radiusKm]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || mapRef.current) return;
    const map = L.map(element, { scrollWheelZoom: false, zoomControl: true, maxZoom: 14 })
      .setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 10);
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    const handleClick = (event: L.LeafletMouseEvent) => {
      setCenter({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const circle = L.circle([center.latitude, center.longitude], {
      radius: radiusKm * 1000,
      color: "#1d6285",
      weight: 2,
      fillColor: "#5aa1c2",
      fillOpacity: .11,
      interactive: false
    });
    circle.addTo(layer);
    L.circleMarker([center.latitude, center.longitude], {
      radius: 7, weight: 3, color: "#fff", fillColor: "#123e55", fillOpacity: 1,
      interactive: false
    }).addTo(layer);

    nearbyProfiles.forEach(profile => {
      const position: L.LatLngExpression = [profile.geo.latitude, profile.geo.longitude];
      const remoteOnly = !profile.consultation_modes.includes("presencial");
      const marker = L.circleMarker(position, {
        radius: 9,
        color: remoteOnly ? "#245e77" : "#9e773c",
        fillColor: remoteOnly ? "#4b92ae" : "#d3a35d",
        fillOpacity: .9,
        weight: 2
      });
      const popup = document.createElement("div");
      popup.className = "lawyer-map-popup";
      const title = document.createElement("strong");
      title.textContent = profile.display_name;
      const distance = document.createElement("p");
      distance.textContent = `${distanceKm(profile.geo, center).toFixed(1)} km del centro · ${profile.municipality}`;
      const label = document.createElement("small");
      label.textContent = remoteOnly ? "ZONA REMOTA FICTICIA" : "DESPACHO FICTICIO · SIN DIRECCIÓN REAL";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Ver ficha de prueba";
      button.addEventListener("click", () => selectRef.current(profile.id));
      popup.append(title, distance, label, button);
      marker.bindPopup(popup).addTo(layer);
    });

    // A radius circle drives the zoom, independently of the number of matches.
    // Widening the radius always expands the visible search area.
    map.invalidateSize();
    map.fitBounds(circle.getBounds(), { padding: [24, 24], animate: true, maxZoom: 14 });
  }, [center, radiusKm, nearbyProfiles]);

  const reset = () => { setCenter(DEFAULT_CENTER); setRadiusKm(DEFAULT_RADIUS_KM); };
  return <div className="lawyer-map-wrap">
    <div className="lawyer-map-caution" role="note">Mapa de simulación: los marcadores y sus distancias son ficticios; no corresponden a domicilios ni abogados reales.</div>
    <div className="lawyer-map-grid">
      <aside className="lawyer-map-sidebar" aria-label="Configurar radio de búsqueda">
        <div className="map-sidebar-title"><SlidersHorizontal size={18}/><strong>Área de búsqueda</strong></div>
        <div className="map-radius-heading"><span>Radio de búsqueda</span><strong>{radiusKm} km</strong></div>
        <input className="map-radius-slider" type="range" min={5} max={100} step={5} value={radiusKm} onChange={event => setRadiusKm(Number(event.target.value))} aria-label="Radio de búsqueda en kilómetros" aria-valuetext={`${radiusKm} kilómetros`}/>
        <div className="map-range-labels"><small>5 km</small><small>100 km</small></div>
        <div className="map-radius-presets" role="group" aria-label="Radios rápidos">
          {[10,25,50,100].map(km => <button type="button" key={km} aria-pressed={radiusKm===km} className={radiusKm===km?"active":""} onClick={()=>setRadiusKm(km)}>{km} km</button>)}
        </div>
        <div className="map-sidebar-divider"/>
        <label className="map-center-label" htmlFor="map-center-select"><MapPin size={16}/> Centro de la búsqueda</label>
        <select id="map-center-select" className="map-center-select" value={
          Object.entries(MAP_CENTERS).find(([,value])=>value.latitude===center.latitude&&value.longitude===center.longitude)?.[0]??"custom"
        } onChange={event=>{
          const key=event.target.value as keyof typeof MAP_CENTERS;
          if (key in MAP_CENTERS) setCenter(MAP_CENTERS[key]);
        }}>
          {Object.entries(MAP_CENTERS).map(([key,value])=><option value={key} key={key}>{value.label}</option>)}
          <option value="custom" disabled>Centro seleccionado en mapa</option>
        </select>
        <p className="map-center-help"><LocateFixed size={15}/> Haz clic sobre el mapa para mover el centro y buscar en otra zona.</p>
        <div className="map-sidebar-divider"/>
        <div className="map-result-stat" role="status" aria-live="polite">
          <strong>{nearbyProfiles.length}</strong><span>abogados ficticios dentro de {radiusKm} km</span>
        </div>
        <p className="map-filter-explanation">El radio se combina con los demás filtros: especialidad, modalidad, ubicación y precio.</p>
        <button className="map-reset" type="button" onClick={reset}><RotateCcw size={15}/> Restablecer radio y centro</button>
      </aside>
      <div className="lawyer-map-main">
        <div ref={elementRef} className="lawyer-leaflet-map" role="region" aria-label="Mapa interactivo con radio y abogados ficticios"/>
        <p className="lawyer-map-footnote">Azul: atención remota simulada · Dorado: zona presencial ficticia. © OpenStreetMap contributors. Sin GPS ni API key.</p>
      </div>
    </div>
  </div>;
}
