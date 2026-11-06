import React, { useState, useMemo } from "react";
import "./TSPVisualizer.scss";

export const TSPVisualizer = ({
  cities = [],
  currentPath = [],
  onCanvasClick,
  width = 800,
  height = 600,
  gridStep = 40,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  const originX = gridStep;
  const originY = height - gridStep;

  const { gridLines, axisLines, axisLabels } = useMemo(() => {
    const lines = [];
    const labels = [];

    for (let x = gridStep; x < width; x += gridStep) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          className="tsp-visualizer__grid-line"
        />
      );
      if (x % 80 === 0 && x < width - 40) {
        labels.push(
          <text
            key={`lx-${x}`}
            x={x}
            y={height - 12}
            className="tsp-visualizer__axis-label"
          >
            {x}
          </text>
        );
      }
    }

    for (let y = gridStep; y < height; y += gridStep) {
      const invertedY = height - y;
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={invertedY}
          x2={width}
          y2={invertedY}
          className="tsp-visualizer__grid-line"
        />
      );
      if (y % 80 === 0 && y < height - 40) {
        labels.push(
          <text
            key={`ly-${y}`}
            x={15}
            y={invertedY + 4}
            className="tsp-visualizer__axis-label"
          >
            {y}
          </text>
        );
      }
    }

    const axes = (
      <g className="tsp-visualizer__main-axes">
        <line
          x1={originX}
          y1={originY}
          x2={width - 20}
          y2={originY}
          className="tsp-visualizer__axis"
        />
        <polygon
          points={`${width - 15},${originY} ${width - 25},${originY - 4} ${width - 25},${originY + 4}`}
          className="tsp-visualizer__arrow"
        />
        <text x={width - 12} y={originY + 4} className="tsp-visualizer__axis-name">
          X
        </text>

        <line
          x1={originX}
          y1={originY}
          x2={originX}
          y2={20}
          className="tsp-visualizer__axis"
        />
        <polygon
          points={`${originX},15 ${originX - 4},25 ${originX + 4},25`}
          className="tsp-visualizer__arrow"
        />
        <text x={originX - 4} y={10} className="tsp-visualizer__axis-name">
          Y
        </text>
      </g>
    );

    return { gridLines: lines, axisLines: axes, axisLabels: labels };
  }, [width, height, gridStep, originX, originY]);


  const pathSegments = useMemo(() => {
    if (!cities.length || currentPath.length < 2) return [];

    const segments = [];
    for (let i = 0; i < currentPath.length; i++) {
      const fromIndex = currentPath[i];
      const toIndex = currentPath[(i + 1) % currentPath.length];

      const cityA = cities[fromIndex];
      const cityB = cities[toIndex];

      if (!cityA || !cityB) continue;

      const dx = cityB.x - cityA.x;
      const dy = cityB.y - cityA.y;
      const distance = Math.hypot(dx, dy);

      const midX = (cityA.x + cityB.x) / 2;
      const midY = (cityA.y + cityB.y) / 2;

      segments.push({
        id: `${fromIndex}-${toIndex}`,
        x1: cityA.x,
        y1: cityA.y,
        x2: cityB.x,
        y2: cityB.y,
        midX,
        midY,
        distance: distance.toFixed(1),
      });
    }

    return segments;
  }, [cities, currentPath]);

  return (
    <div className="tsp-visualizer">
      <svg
        className="tsp-visualizer__canvas"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          if (
            e.target.tagName === "svg" ||
            e.target.classList.contains("tsp-visualizer__bg")
          ) {
            setSelectedCityId(null);
          }
          if (onCanvasClick) onCanvasClick(e);
        }}
      >
        <rect width={width} height={height} className="tsp-visualizer__bg" />

        <g className="tsp-visualizer__grid">{gridLines}</g>
        {axisLines}
        <g className="tsp-visualizer__axes-labels">{axisLabels}</g>

        {/* Отрезки маршрута (без стрелок, чистые линии) */}
        <g className="tsp-visualizer__routes">
          {pathSegments.map((segment) => {
            const isHovered = hoveredSegment === segment.id;

            return (
              <g key={segment.id}>
                <line
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  className="tsp-visualizer__route-hitbox"
                  onMouseEnter={() => setHoveredSegment(segment.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                <line
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  className={`tsp-visualizer__route-line ${
                    isHovered ? "is-hovered" : ""
                  }`}
                />
                {isHovered && (
                  <g
                    className="tsp-visualizer__distance-badge"
                    transform={`translate(${segment.midX}, ${segment.midY})`}
                  >
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="4"
                      className="tsp-visualizer__badge-bg"
                    />
                    <text x="0" y="3" className="tsp-visualizer__badge-text">
                      {segment.distance}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

   
        {cities.map((city, index) => {
          const cityIndex = index + 1;
          const isSelected = selectedCityId === city.id;

          return (
            <g
              key={city.id ?? index}
              className={`tsp-visualizer__city-group ${
                isSelected ? "is-selected" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCityId(isSelected ? null : city.id);
              }}
            >
              {index === 0 && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={12}
                  className="tsp-visualizer__city-start"
                />
              )}
              <circle
                cx={city.x}
                cy={city.y}
                r={isSelected ? 7 : 5}
                className={`tsp-visualizer__city-node ${
                  isSelected ? "is-selected" : ""
                }`}
              />
              <text
                x={city.x}
                y={city.y - 12}
                className="tsp-visualizer__city-label"
              >
                {cityIndex}
              </text>

              {isSelected && (
                <g
                  className="tsp-visualizer__coord-badge"
                  transform={`translate(${city.x}, ${city.y + 18})`}
                >
                  <rect
                    x="-32"
                    y="-9"
                    width="64"
                    height="18"
                    rx="3"
                    className="tsp-visualizer__badge-bg"
                  />
                  <text x="0" y="3" className="tsp-visualizer__badge-text">
                    {city.x}, {height - city.y}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TSPVisualizer;