import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SnapToGrid } from "./components/snap-to-grid/snap-to-grid.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <SnapToGrid />
  </StrictMode>
);
