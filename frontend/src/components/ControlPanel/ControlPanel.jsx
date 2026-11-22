import React, { useState } from "react";
import SliderInput from "../SliderInput/SliderInput";
import Button from "../Button/Button";
import InfoIcon from "../../assets/icons/InfoIcon";
import "./ControlPanel.scss";

const ControlPanel = ({ settings, onChange, onRun, onReset }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
        <div className="panel-actions__buttons">
          <Button text="Запустить" variant="btn-blue" onClick={onRun} />

          <Button text="Сбросить" variant="btn-outline" onClick={onReset} />
        </div>

        <button
          type="button"
          className={`panel-info-button ${isInfoOpen ? "is-active" : ""}`}
          onClick={() => setIsInfoOpen((prev) => !prev)}
          aria-label="Информация о генетическом алгоритме"
          aria-expanded={isInfoOpen}
          title="Информация"
        >
          <InfoIcon />
        </button>
      </div>

      {isInfoOpen && (
        <div className="panel-info">
          <h3>О генетическом алгоритме</h3>

          <p>
            Генетический алгоритм — это метод оптимизации, основанный на
            принципах естественного отбора. Он постепенно улучшает набор
            возможных решений, чтобы найти наиболее подходящий результат.
          </p>

          <h4>Основные параметры</h4>

          <ul>
            <li>
              <strong>Количество городов</strong> — число точек, которые
              необходимо посетить.
            </li>

            <li>
              <strong>Размер популяции</strong> — количество вариантов маршрута
              в каждом поколении.
            </li>

            <li>
              <strong>Количество поколений</strong> — число этапов
              последовательного улучшения решений.
            </li>

            <li>
              <strong>Шанс мутации</strong> — вероятность случайного изменения
              маршрута для сохранения разнообразия решений.
            </li>
          </ul>

          <h4>Зачем это нужно?</h4>

          <p>
            Генетический алгоритм помогает находить короткие маршруты для задачи
            коммивояжёра. Визуализация показывает, как меняется найденное
            решение, а график позволяет наблюдать за сходимостью алгоритма.
          </p>
        </div>
      )}
    </aside>
  );
};

export default ControlPanel;
