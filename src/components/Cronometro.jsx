import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const Cronometro = ({ startTime, className = '' }) => {
  const [elapsedTime, setElapsedTime] = useState(Date.now() - startTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  const formatTime = (ms) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-mono bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg ${className}`}>
      <FiClock />
      <span>{formatTime(elapsedTime)}</span>
    </div>
  );
};

export default Cronometro;