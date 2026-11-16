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

function lawyerPin(remoteOnly: boolean, near: boolean): L.DivIcon {
  // El mismo símbolo de huella de HuellaVet, sobre la paleta oficial de marca.
  const color = remoteOnly ? "#BCA8FF" : "#7447EB";
  const opacity = near ? "1" : ".65";
  const svg = `<svg width="42" height="52" viewBox="0 0 42 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 1.5C10.9 1.5 3 9.5 3 19.3 3 33.1 21 50 21 50S39 33.1 39 19.3C39 9.5 31.1 1.5 21 1.5Z" fill="${color}" fill-opacity="${opacity}" stroke="#fff" stroke-width="2.7"/>
    <g transform="translate(7 6) scale(1.14)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/>
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
    </g>
  </svg>`;
  return L.divIcon({ className:"huellavet-pin-container " + (near ? "inside-search" : "outside-search"), html:svg, iconSize:[42,52], iconAnchor:[21,51], popupAnchor:[0,-47] });
}

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

  const outsideCount = profiles.filter(profile => profile.geo?.synthetic).length - nearbyProfiles.length;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || mapRef.current) return;
    const map = L.map(element, { scrollWheelZoom: true, zoomControl: true, maxZoom: 18 })
      .setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 10);
    mapRef.current = map;
    // Public raster tiles: if the primary host fails, use a second public OSM-based source.
    // No API keys, no GPS or geolocation data is required.
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution
    }).addTo(map);
    let tileErrors = 0;
    let fallbackEnabled = false;
    tiles.on("tileerror", () => {
      tileErrors += 1;
      if (tileErrors < 2 || fallbackEnabled) return;
      fallbackEnabled = true;
      map.removeLayer(tiles);
      L.tileLayer("https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: attribution + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
      }).addTo(map);
    });
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
      color: "#7447EB",
      weight: 2,
      fillColor: "#BCA8FF",
      fillOpacity: .11,
      interactive: false
    });
    circle.addTo(layer);
    L.circleMarker([center.latitude, center.longitude], {
      radius: 7, weight: 3, color: "#fff", fillColor: "#7447EB", fillOpacity: 1,
      interactive: false
    }).addTo(layer);

    // Markers outside the radius remain accessible whenever visible in the map viewport.
    profiles.forEach(profile => {
      if (!profile.geo?.synthetic) return;
      const position: L.LatLngExpression = [profile.geo.latitude, profile.geo.longitude];
      const remoteOnly = !profile.consultation_modes.includes("presencial");
      const inRadius = isWithinRadius(profile.geo, center, radiusKm);
      const marker = L.marker(position, {
        icon: lawyerPin(remoteOnly, inRadius),
        title: profile.display_name + (inRadius ? " · Dentro del radio" : " · Fuera del radio"),
        alt: "Ubicación ficticia de " + profile.display_name,
        riseOnHover: true, keyboard: true
      });
      const popup = document.createElement("div");
      popup.className = "lawyer-map-popup";
      const title = document.createElement("strong");
      title.textContent = profile.display_name;
      const distance = document.createElement("p");
      distance.textContent = `${distanceKm(profile.geo, center).toFixed(1)} km del centro · ${profile.municipality}`;
      const label = document.createElement("small");
      label.textContent = (inRadius ? "DENTRO DEL RADIO · " : "FUERA DEL RADIO · ") + (remoteOnly ? "ZONA REMOTA FICTICIA" : "CLÍNICA FICTICIA");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Ver perfil veterinario";
      button.addEventListener("click", () => selectRef.current(profile.id));
      popup.append(title, distance, label, button);
      marker.bindPopup(popup).addTo(layer);
    });

    // Rebuild markers without overriding any zoom or pan set by the visitor.
    map.invalidateSize();
  }, [center, radiusKm, profiles]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Changing the radius or center should frame the requested search area.
    const area = L.circle([center.latitude, center.longitude], { radius: radiusKm * 1000 });
    map.fitBounds(area.getBounds(), { padding: [24, 24], animate: true, maxZoom: 15 });
  }, [center, radiusKm]);

  const reset = () => { setCenter(DEFAULT_CENTER); setRadiusKm(DEFAULT_RADIUS_KM); };
  return <div className="lawyer-map-wrap">
    <div className="lawyer-map-caution" role="note">Mapa ilustrativo: los marcadores y distancias son de prueba y no corresponden a domicilios de clínicas reales.</div>
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
          <strong>{nearbyProfiles.length}</strong><span>veterinarios ficticios dentro de {radiusKm} km</span><small>{outsideCount} fuera del radio (visibles al explorar el mapa)</small>
        </div>
        <p className="map-filter-explanation">El radio destaca profesionales cercanos, pero no oculta a los demás que aparezcan en el mapa. Los otros filtros siguen activos.</p>
        <button className="map-reset" type="button" onClick={reset}><RotateCcw size={15}/> Restablecer radio y centro</button>
      </aside>
      <div className="lawyer-map-main">
        <div ref={elementRef} className="lawyer-leaflet-map" role="region" aria-label="Mapa interactivo con radio y veterinarios ficticios"/>
        <p className="lawyer-map-footnote">Huellas lavanda: orientación en línea · Huellas moradas: atención presencial. © OpenStreetMap contributors. Ubicaciones ficticias; sin GPS ni API key.</p>
      </div>
    </div>
  </div>;
}
