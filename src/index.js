// src/index.js - Remove StrictMode
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // Remove StrictMode to prevent double mounting in development
  <BrowserRouter>
    <App />
  </BrowserRouter>
);