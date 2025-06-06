// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";  // if you have a global stylesheet; adjust or remove as needed

// Find the <div id="root"></div> in your index.html (see Step 2 below)
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find <div id='root'> in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
