import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/base.css";
import "./styles/animations.css";
import "./styles/layout.css";
import "./styles/crt-theme.css";
import "./styles/scrollbars.css";
import "./styles/components/header.css";
import "./styles/components/room.css";
import "./styles/components/reactor-big-board.css";
import "./styles/components/log-and-input.css";
import "./styles/components/sidebar-tabs.css";
import "./styles/components/compass.css";
import "./styles/components/vitals.css";
import "./styles/components/hints.css";
import "./styles/status-effects.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
