import React from "react";
import SliderInput from "../SliderInput/SliderInput";
import Button from "../Button/Button";
import "./ControlPanel.scss";

const ControlPanel = ({ settings, onChange, onRun, onReset }) => {
  return (
    <aside className="control-panel">
      <div className="panel-header">
        <h2>Параметры</h2>
        <p>Настройки генетического алгоритма</p>
      </div>

      <div className="panel-inputs">
        <SliderInput
          label="Количество городов"
          value={settings.citiesCount}
          onChange={(val) => onChange("citiesCount", val)}
          min={5}
          max={100}
          step={1}
        />

        <SliderInput
          label="Размер популяции"
          value={settings.populationSize}
          onChange={(val) => onChange("populationSize", val)}
          min={50}
          max={1000}
          step={10}
        />

        <SliderInput
          label="Количество поколений"
          value={settings.generations}
          onChange={(val) => onChange("generations", val)}
          min={10}
          max={1000}
          step={10}
        />

        <SliderInput
          label="Шанс мутации"
          value={settings.mutationRate}
          onChange={(val) => onChange("mutationRate", val)}
          min={0.01}
          max={0.2}
          step={0.01}
        />
      </div>

      <div className="panel-actions">
        <Button text="Запустить" variant="btn-blue" onClick={onRun} />
        <Button text="Сбросить" variant="btn-outline" onClick={onReset} />
      </div>
    </aside>
  );
};

export default ControlPanel;
