import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ServiceLocator from "./api/service.locator";

// init the servicea
ServiceLocator.initializeServices();
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
