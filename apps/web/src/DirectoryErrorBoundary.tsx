import { HuellaIcon } from "./HuellaIcon";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onFallback: () => void;
  scope?: "map" | "directory";
};
type State = { hasError: boolean };

export class DirectoryErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the rest of the interface mounted if a map component throws.
    console.error("HuellaVet directory render failure", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="hv-directory-safe-fallback" role="alert">
        <HuellaIcon size={28} />
        <h2>No se pudo mostrar {this.props.scope === "map" ? "el mapa" : "el directorio"}</h2>
        <p>La búsqueda sigue disponible. Puedes continuar con la vista de lista y volver a intentar.</p>
        <button type="button" onClick={this.props.onFallback}>
          {this.props.scope === "map" ? "Ver veterinarios en lista" : "Volver al inicio"}
        </button>
      </section>
    );
  }
}
