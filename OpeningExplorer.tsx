import React, { useState, useEffect } from 'react';

interface OpeningMove {
  move: string;
  frequency: number;
  whiteWins: number;
  draws: number;
  blackWins: number;
}

const OpeningExplorer: React.FC = () => {
  const [openingMoves, setOpeningMoves] = useState<OpeningMove[]>([]);

  useEffect(() => {
    fetch('/api/openings')
      .then(res => res.json())
      .then(data => setOpeningMoves(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Opening Explorer</h2>
      <ul>
        {openingMoves.map((move, index) => (
          <li key={index}>
            {move.move}: Played {move.frequency} times, W: {move.whiteWins}, D: {move.draws}, B: {move.blackWins}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OpeningExplorer;
