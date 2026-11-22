import React, { useState, useEffect, useCallback, useRef } from "react";
import ControlPanel from "./components/ControlPanel/ControlPanel";
import TSPVisualizer from "./components/TSPVisualizer/TSPVisualizer";
import AlgorithmHistory from "./components/AlgorithmHistory/AlgorithmHistory";
import "./App.scss";

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

  const [cities, setCities] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bestLength, setBestLength] = useState(null);
  const [currentGenIndex, setCurrentGenIndex] = useState(0);
  const [history, setHistory] = useState([]);

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
    setHistory([]);

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
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        setCities(data.cities);
        setCurrentPath(data.route);
        setBestLength(data.length);
        setCurrentGenIndex(data.generation);
        setHistory(data.history ?? []);
      } else if (data.type === "update" || data.type === "done") {
        setCurrentPath(data.route);
        setBestLength(data.length);
        setCurrentGenIndex(data.generation);
        setHistory(data.history ?? []);

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
    setHistory([]);

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
    <div className="app-layout">
      <ControlPanel
        settings={settings}
        onChange={handleSettingChange}
        onRun={handleRun}
        onReset={handleReset}
      />

      <main className="app-main">
        <div className="app-stats">
          <h2 className="app-title">Визуализация генетического алгоритма</h2>

          <p className="app-subtitle">Решение задачи коммивояжёра (TSP)</p>

          <div className="app-stats__values">
            <h4>
              Поколение:{" "}
              <strong>
                {currentGenIndex} / {settings.generations}
              </strong>
            </h4>

            <h4>
              Длина пути:{" "}
              <strong>{bestLength !== null ? bestLength : "—"}</strong>
            </h4>
          </div>
        </div>

        <div className="app-visualizer">
          <TSPVisualizer
            cities={cities}
            currentPath={currentPath}
            width={800}
            height={600}
          />
        </div>
      </main>

      <AlgorithmHistory history={history} />
    </div>
  );
}

export default App;
