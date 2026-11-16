import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import "./vet-theme.css";
import "./tech-premium.css";
import "./distinctive-home.css";
import "./huellavet-2026.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el contenedor principal");
createRoot(root).render(<App />);
