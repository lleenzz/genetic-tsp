import React, { useState, useMemo } from "react";
import "./TSPVisualizer.scss";

export const TSPVisualizer = ({
  cities = [],
  currentPath = [],
  onCanvasClick,
  width = 800,
  height = 600,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  const gridMax = 100;
  const padding = 60;

  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const normalizedCities = useMemo(() => {
    if (!cities.length) return [];

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    cities.forEach((c) => {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    });

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    return cities.map((c) => ({
      ...c,
      gridX: ((c.x - minX) / rangeX) * 80 + 10,
      gridY: ((c.y - minY) / rangeY) * 80 + 10,
      originalX: c.x,
      originalY: c.y,
    }));
  }, [cities]);

  const scaleX = (x) => padding + (x / gridMax) * graphWidth;
  const scaleY = (y) => height - padding - (y / gridMax) * graphHeight;

  const originX = scaleX(0);
  const originY = scaleY(0);

  const { gridLines, axisLines, axisLabels } = useMemo(() => {
    const lines = [];
    const labels = [];
    const step = 10;

    for (let val = 0; val <= gridMax; val += step) {
      const px = scaleX(val);
      const py = scaleY(val);

      if (val > 0 && val < gridMax) {
        lines.push(
          <line
            key={`v-${val}`}
            x1={px}
            y1={scaleY(gridMax)}
            x2={px}
            y2={scaleY(0)}
            className="tsp-visualizer__grid-line"
          />,
        );
        lines.push(
          <line
            key={`h-${val}`}
            x1={scaleX(0)}
            y1={py}
            x2={scaleX(gridMax)}
            y2={py}
            className="tsp-visualizer__grid-line"
          />,
        );
      }

      if (val % 20 === 0) {
        labels.push(
          <text
            key={`lx-${val}`}
            x={px}
            y={originY + 20}
            className="tsp-visualizer__axis-label"
            textAnchor="middle"
          >
            {val}
          </text>,
        );
        labels.push(
          <text
            key={`ly-${val}`}
            x={originX - 15}
            y={py + 4}
            className="tsp-visualizer__axis-label"
            textAnchor="end"
          >
            {val}
          </text>,
        );
      }
    }

    const axes = (
      <g className="tsp-visualizer__main-axes">
        <line
          x1={scaleX(0)}
          y1={originY}
          x2={scaleX(gridMax) + 20}
          y2={originY}
          className="tsp-visualizer__axis"
        />
        <polygon
          points={`${scaleX(gridMax) + 20},${originY} ${scaleX(gridMax) + 10},${originY - 4} ${scaleX(gridMax) + 10},${originY + 4}`}
          className="tsp-visualizer__arrow"
        />
        <text
          x={scaleX(gridMax) + 25}
          y={originY + 4}
          className="tsp-visualizer__axis-name"
        >
          X
        </text>

        <line
          x1={originX}
          y1={scaleY(0)}
          x2={originX}
          y2={scaleY(gridMax) - 20}
          className="tsp-visualizer__axis"
        />
        <polygon
          points={`${originX},${scaleY(gridMax) - 20} ${originX - 4},${scaleY(gridMax) - 10} ${originX + 4},${scaleY(gridMax) - 10}`}
          className="tsp-visualizer__arrow"
        />
        <text
          x={originX - 4}
          y={scaleY(gridMax) - 25}
          className="tsp-visualizer__axis-name"
        >
          Y
        </text>
      </g>
    );

    return { gridLines: lines, axisLines: axes, axisLabels: labels };
  }, [width, height, graphWidth, graphHeight, originX, originY]);

  const pathSegments = useMemo(() => {
    if (!normalizedCities.length || currentPath.length < 2) return [];

    const segments = [];
    for (let i = 0; i < currentPath.length; i++) {
      const fromIndex = currentPath[i];
      const toIndex = currentPath[(i + 1) % currentPath.length];

      const cityA = normalizedCities[fromIndex];
      const cityB = normalizedCities[toIndex];

      if (!cityA || !cityB) continue;

      const dx = cityB.originalX - cityA.originalX;
      const dy = cityB.originalY - cityA.originalY;
      const distance = Math.hypot(dx, dy);

      const x1 = scaleX(cityA.gridX);
      const y1 = scaleY(cityA.gridY);
      const x2 = scaleX(cityB.gridX);
      const y2 = scaleY(cityB.gridY);

      segments.push({
        id: `${fromIndex}-${toIndex}`,
        x1,
        y1,
        x2,
        y2,
        midX: (x1 + x2) / 2,
        midY: (y1 + y2) / 2,
        distance: distance.toFixed(1),
      });
    }

    return segments;
  }, [normalizedCities, currentPath]);

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
                  className={`tsp-visualizer__route-line ${isHovered ? "is-hovered" : ""}`}
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

        {normalizedCities.map((city, index) => {
          const cityIndex = index + 1;
          const isSelected = selectedCityId === city.id;
          const cx = scaleX(city.gridX);
          const cy = scaleY(city.gridY);

          return (
            <g
              key={city.id ?? index}
              className={`tsp-visualizer__city-group ${isSelected ? "is-selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCityId(isSelected ? null : city.id);
              }}
            >
              {index === 0 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  className="tsp-visualizer__city-start"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 7 : 5}
                className={`tsp-visualizer__city-node ${isSelected ? "is-selected" : ""}`}
              />
              <text x={cx} y={cy - 12} className="tsp-visualizer__city-label">
                {cityIndex}
              </text>

              {isSelected && (
                <g
                  className="tsp-visualizer__coord-badge"
                  transform={`translate(${cx}, ${cy + 18})`}
                >
                  <rect
                    x="-40"
                    y="-9"
                    width="80"
                    height="18"
                    rx="3"
                    className="tsp-visualizer__badge-bg"
                  />
                  <text x="0" y="3" className="tsp-visualizer__badge-text">
                    {Math.round(city.originalX)}, {Math.round(city.originalY)}
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
