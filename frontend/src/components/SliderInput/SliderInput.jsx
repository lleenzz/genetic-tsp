import React, { useState, useEffect } from "react";
import "./SliderInput.scss";

const SliderInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextValue(raw);

    if (raw === "") return;

    const num = Number(raw);
    if (!isNaN(num)) onChange(num);
  };

  /**
    Обработка потери фокуса: приведение типа, округление под шаг и клампинг в пределах min/max.
   */
  const handleBlur = () => {
    if (textValue === "" || isNaN(Number(textValue))) {
      setTextValue(value);
      return;
    }

    let num = Number(textValue);

    if (Number.isInteger(step)) {
      num = Math.round(num);
    }

    num = Math.min(Math.max(num, min), max);

    setTextValue(num);
    onChange(num);
  };

  const handleRangeChange = (e) => {
    let num = Number(e.target.value);

    if (Number.isInteger(step)) {
      num = Math.round(num);
    }

    setTextValue(num);
    onChange(num);
  };

  return (
    <div className="slider-input-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <input
          type="number"
          className="slider-number-field"
          value={textValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <input
        type="range"
        className="slider-range-field"
        value={value}
        onChange={handleRangeChange}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

export default SliderInput;
