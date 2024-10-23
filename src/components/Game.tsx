import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Card {
  suit: string;
  value: string;
}

export default function Game() {
  const { user } = useAuth();
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState(10);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [message, setMessage] = useState('');

  const startGame = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/game/start', { bet });
      setPlayerHand(response.data.playerHand);
      setDealerHand(response.data.dealerHand);
      setGameStatus('playing');
    } catch (error) {
      setMessage('Error starting game');
    }
  };

  const hit = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/game/hit');
      setPlayerHand(response.data.playerHand);
      if (response.data.gameOver) {
        setGameStatus('finished');
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error hitting');
    }
  };

  const stand = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/game/stand');
      setDealerHand(response.data.dealerHand);
      setGameStatus('finished');
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error standing');
    }
  };

  return (
    <div className="min-h-screen bg-green-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Blackjack</h1>
          <div>Yaks: {user?.yaks}</div>
        </div>

        {gameStatus === 'waiting' && (
          <div className="text-center">
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              className="bg-white text-black p-2 rounded mr-4"
              min="10"
              max={user?.yaks}
            />
            <button
              onClick={startGame}
              className="bg-yellow-500 text-black px-4 py-2 rounded"
            >
              Start Game
            </button>
          </div>
        )}

        {gameStatus !== 'waiting' && (
          <div className="space-y-8">
            <div className="bg-green-900 p-4 rounded">
              <h2 className="text-xl mb-4">Dealer's Hand</h2>
              <div className="flex gap-4">
                {dealerHand.map((card, index) => (
                  <div key={index} className="bg-white text-black p-4 rounded">
                    {card.value} of {card.suit}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-900 p-4 rounded">
              <h2 className="text-xl mb-4">Your Hand</h2>
              <div className="flex gap-4">
                {playerHand.map((card, index) => (
                  <div key={index} className="bg-white text-black p-4 rounded">
                    {card.value} of {card.suit}
                  </div>
                ))}
              </div>
            </div>

            {gameStatus === 'playing' && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={hit}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  Stand
                </button>
              </div>
            )}

            {message && (
              <div className="text-center text-xl font-bold">{message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}