import React from 'react';

import './index.css';

interface CircleProgressProps {
  percentage: number;
  count: number;
  label: string;
}

const CircleProgress: React.FC<CircleProgressProps> = ({ percentage, count, label }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circle-progress">
      <svg className="circle-progress__svg" width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="10"
          fill="transparent"
          className="circle-progress__bg"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="circle-progress__fg"
        />
      </svg>
      <div className="circle-progress__text">
        <span className="circle-progress__count">{count}</span>
        <span className="circle-progress__label">{label}</span>
      </div>
    </div>
  );
};

export default CircleProgress;
