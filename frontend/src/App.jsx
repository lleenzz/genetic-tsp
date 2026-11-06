import React, { useState, useEffect, useCallback } from "react";
import ControlPanel from "./components/ControlPanel/ControlPanel";
import TSPVisualizer from "./components/TSPVisualizer/TSPVisualizer";

// Функция для генерации случайных точек (городов)
const generateRandomCities = (
  count,
  width = 800,
  height = 600,
  padding = 50,
) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.floor(Math.random() * (width - padding * 2)) + padding,
    y: Math.floor(Math.random() * (height - padding * 2)) + padding,
  }));
};

function App() {
  const [settings, setSettings] = useState({
    citiesCount: 25,
    populationSize: 200,
    generations: 200,
    mutationRate: 0.02,
    seed: 42,
  });

  // Состояние для городов и текущего маршрута
  const [cities, setCities] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);


  const handleGenerateCities = useCallback(() => {
    const newCities = generateRandomCities(settings.citiesCount);
    setCities(newCities);
    setCurrentPath(newCities.map((_, index) => index));
  }, [settings.citiesCount]);


  useEffect(() => {
    handleGenerateCities();
  }, [handleGenerateCities]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    console.log("Запуск алгоритма с параметрами:", settings);
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSettings({
      citiesCount: 25,
      populationSize: 200,
      generations: 200,
      mutationRate: 0.02,
      seed: 42,
    });
  
    const newCities = generateRandomCities(25);
    setCities(newCities);
    setCurrentPath(newCities.map((_, index) => index));
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          
          boxSizing: "border-box",
        }}
      >
        <TSPVisualizer
          cities={cities}
          currentPath={currentPath}
          width={800}
          height={600}
        />
      </main>
    </div>
  );
}

export default App;
