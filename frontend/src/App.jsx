import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel/ControlPanel";

function App() {
  const [settings, setSettings] = useState({
    citiesCount: 25,
    populationSize: 200,
    generations: 200,
    mutationRate: 0.02,
    seed: 42,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    console.log("Запуск алгоритма с параметрами:", settings);
  };

  const handleReset = () => {
    setSettings({
      citiesCount: 25,
      populationSize: 200,
      generations: 200,
      mutationRate: 0.02,
      seed: 42,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--TBlack)",
      }}
    >
      <ControlPanel
        settings={settings}
        onChange={handleSettingChange}
        onRun={handleRun}
        onReset={handleReset}
      />

      <main
        style={{
          flex: 1,
          backgroundColor: "var(--TBlack)",
        }}
      />
    </div>
  );
}

export default App;
