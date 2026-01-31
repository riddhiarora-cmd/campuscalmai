import React from "react";
import JustBreathe from "./components/JustBreathe";

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Just Breathe</h1>
        <p className="subtitle">A short visual breathing guide — no logging, no questions.</p>
      </header>
      <main>
        <JustBreathe />
      </main>
    </div>
  );
}
