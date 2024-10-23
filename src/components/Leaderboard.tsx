import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leaderboard() {
  const [weeklyLeaders, setWeeklyLeaders] = useState([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      const [weeklyRes, monthlyRes] = await Promise.all([
        axios.get('http://localhost:3000/api/leaderboard/weekly'),
        axios.get('http://localhost:3000/api/leaderboard/monthly')
      ]);
      setWeeklyLeaders(weeklyRes.data);
      setMonthlyLeaders(monthlyRes.data);
    };
    fetchLeaderboards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Leaderboards</h1>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Weekly Top Players</h2>
            <div className="space-y-4">
              {weeklyLeaders.map((player: any, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{index + 1}. {player.username}</span>
                  <span>{player.yaks} Yaks</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Monthly Top Players</h2>
            <div className="space-y-4">
              {monthlyLeaders.map((player: any, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{index + 1}. {player.username}</span>
                  <span>{player.yaks} Yaks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}