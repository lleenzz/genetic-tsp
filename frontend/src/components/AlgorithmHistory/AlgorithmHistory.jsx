import React, { useEffect, useMemo, useRef } from "react";
import "./AlgorithmHistory.scss";

const AlgorithmHistory = ({ history = [] }) => {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [history.length]);

  const values = useMemo(
    () => history.map(Number).filter(Number.isFinite),
    [history],
  );

  const bestValue = values.length ? Math.min(...values).toFixed(2) : "—";

  const chart = useMemo(() => {
    if (!values.length) return null;

    const width = 380;
    const height = 190;

    const left = 65;
    const right = 28;
    const top = 18;
    const bottom = 48;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    let dataMin = minValue;
    let dataMax = maxValue;

    if (dataMin === dataMax) {
      const padding = Math.abs(dataMin) * 0.05 || 1;
      dataMin -= padding;
      dataMax += padding;
    }

    // Подбираем удобный шаг шкалы на основе полученных данных.
    const range = dataMax - dataMin;
    const rawStep = range / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalizedStep = rawStep / magnitude;

    let niceStep;

    if (normalizedStep <= 1) {
      niceStep = magnitude;
    } else if (normalizedStep <= 2) {
      niceStep = 2 * magnitude;
    } else if (normalizedStep <= 5) {
      niceStep = 5 * magnitude;
    } else {
      niceStep = 10 * magnitude;
    }

    const axisMin = Math.floor(dataMin / niceStep) * niceStep;
    const axisMax = Math.ceil(dataMax / niceStep) * niceStep;

    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const points = values.map((value, index) => {
      const x =
        values.length === 1
          ? left + plotWidth / 2
          : left + (index / (values.length - 1)) * plotWidth;

      const y = top + ((axisMax - value) / (axisMax - axisMin)) * plotHeight;

      return `${x},${y}`;
    });

    const yTicks = [];

    for (
      let value = axisMin;
      value <= axisMax + niceStep * 0.001;
      value += niceStep
    ) {
      yTicks.push({
        value: Number(value.toPrecision(6)).toString(),
        y: top + ((axisMax - value) / (axisMax - axisMin)) * plotHeight,
      });
    }

    const xLabels = [
      ...new Set([1, Math.ceil(values.length / 2), values.length]),
    ];

    const xTicks = xLabels.map((generation) => ({
      label: String(generation),
      x:
        values.length === 1
          ? left + plotWidth / 2
          : left + ((generation - 1) / (values.length - 1)) * plotWidth,
    }));

    return {
      points: points.join(" "),
      yTicks,
      xTicks,
      left,
      right: width - right,
      top,
      bottom: height - bottom,
    };
  }, [values]);

  return (
    <aside className="algorithm-history">
      <div className="algorithm-history__header">
        <h2>Анализ алгоритма</h2>
      </div>

      <section className="algorithm-history__table-section">
        <h4 className="algorithm-history__section-title">История поколений</h4>

        <div className="algorithm-history__table">
          <div className="algorithm-history__table-head">
            <span>Поколение</span>
            <span>Лучшая длина</span>
          </div>

          <div className="algorithm-history__table-body" ref={tableRef}>
            {values.length === 0 ? (
              <div className="algorithm-history__empty">
                История появится после запуска алгоритма
              </div>
            ) : (
              values.map((length, index) => (
                <div className="algorithm-history__table-row" key={index}>
                  <span>{index + 1}</span>
                  <span>{length.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="algorithm-history__chart-section">
        <div className="algorithm-history__best">
          <span>Лучшее значение</span>
          <strong>{bestValue}</strong>
        </div>

        <h4 className="algorithm-history__section-title">График сходимости</h4>

        <div className="algorithm-history__chart">
          {!chart ? (
            <div className="algorithm-history__chart-empty">
              График появится после запуска алгоритма
            </div>
          ) : (
            <svg
              viewBox="0 0 380 190"
              className="algorithm-history__chart-svg"
              role="img"
              aria-label="График изменения лучшей длины маршрута по поколениям"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="chart-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="7"
                  refY="5"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0,0 L10,5 L0,10" fill="var(--TWhite)" />
                </marker>
              </defs>

              {chart.yTicks.map((tick, index) => (
                <g key={index}>
                  <line
                    x1={chart.left}
                    y1={tick.y}
                    x2={chart.right}
                    y2={tick.y}
                    className="algorithm-history__chart-grid"
                  />

                  <text
                    x={chart.left - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    className="algorithm-history__chart-tick"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              {/* Вертикальная ось со стрелкой */}
              <line
                x1={chart.left}
                y1={chart.bottom}
                x2={chart.left}
                y2={chart.top - 8}
                className="algorithm-history__chart-axis"
                markerEnd="url(#chart-arrow)"
              />

              {/* Горизонтальная ось со стрелкой */}
              <line
                x1={chart.left}
                y1={chart.bottom}
                x2={chart.right + 12}
                y2={chart.bottom}
                className="algorithm-history__chart-axis"
                markerEnd="url(#chart-arrow)"
              />

              {/* Подпись вертикальной оси */}
              <text
                x="15"
                y={(chart.top + chart.bottom) / 2}
                textAnchor="middle"
                transform={`rotate(-90 15 ${(chart.top + chart.bottom) / 2})`}
                className="algorithm-history__chart-axis-label"
              >
                Длина маршрута
              </text>

              {values.length > 1 && (
                <polyline
                  points={chart.points}
                  className="algorithm-history__chart-line"
                />
              )}

              {values.length === 1 && (
                <circle
                  cx={(chart.left + chart.right) / 2}
                  cy={(chart.top + chart.bottom) / 2}
                  r="4"
                  className="algorithm-history__chart-point"
                />
              )}

              {chart.xTicks.map((tick, index) => (
                <text
                  key={index}
                  x={tick.x}
                  y={chart.bottom + 20}
                  textAnchor="middle"
                  className="algorithm-history__chart-tick"
                >
                  {tick.label}
                </text>
              ))}

              {/* Подпись горизонтальной оси */}
              <text
                x={(chart.left + chart.right) / 2}
                y="186"
                textAnchor="middle"
                className="algorithm-history__chart-axis-label"
              >
                Поколение
              </text>
            </svg>
          )}
        </div>
      </section>
    </aside>
  );
};

export default AlgorithmHistory;
