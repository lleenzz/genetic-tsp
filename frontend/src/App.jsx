import React, { useState, useEffect, useCallback, useRef } from "react";
import ControlPanel from "./components/ControlPanel/ControlPanel";
import TSPVisualizer from "./components/TSPVisualizer/TSPVisualizer";

const generateRandomCities = (
  count,
  width = 800,
  height = 600,
  padding = 50
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

  const [cities, setCities] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bestLength, setBestLength] = useState(null);
  const [currentGenIndex, setCurrentGenIndex] = useState(0);

  const wsRef = useRef(null);

  const handleGenerateCities = useCallback(() => {
    const newCities = generateRandomCities(settings.citiesCount);
    setCities(newCities);
    setCurrentPath(newCities.map((_, index) => index));
  }, [settings.citiesCount]);

  useEffect(() => {
    handleGenerateCities();
  }, [handleGenerateCities]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };


  const handleRun = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setIsRunning(true);
    setCurrentGenIndex(0);
    setBestLength(null);

    const ws = new WebSocket("ws://localhost:8000/ws/solve");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          n_cities: settings.citiesCount,
          pop_size: settings.populationSize,
          generations: settings.generations,
          mutation_rate: settings.mutationRate,
          seed: settings.seed,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        setCities(data.cities);
        setCurrentPath(data.route);
        setBestLength(data.length);
        setCurrentGenIndex(data.generation);
      } else if (data.type === "update" || data.type === "done") {
        setCurrentPath(data.route);
        setBestLength(data.length);
        setCurrentGenIndex(data.generation);

        if (data.type === "done") {
          setIsRunning(false);
          ws.close();
        }
      }
    };

    ws.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
      setIsRunning(false);
    };

    ws.onclose = () => {
      setIsRunning(false);
    };
  };

  const handleReset = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsRunning(false);
    setCurrentGenIndex(0);
    setBestLength(null);
    setSettings({
      citiesCount: 25,
      populationSize: 200,
      generations: 200,
      mutationRate: 0.02,
      seed: 42,
    });

    handleGenerateCities();
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            color: "var(--TWhite)",
            fontFamily: "monospace",
            fontSize: "16px",
            opacity: 0.8,
            display: "flex",
            gap: "20px",
          }}
        >
          <div>
            Поколение: <strong>{currentGenIndex} / {settings.generations}</strong>
          </div>
          <div>
            Длина пути: <strong>{bestLength !== null ? bestLength : "—"}</strong>
          </div>
        </div>

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