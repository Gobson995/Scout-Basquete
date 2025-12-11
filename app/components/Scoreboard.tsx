import React from 'react';
import { Periodo } from '../../types/game';

interface ScoreboardProps {
  myScore: number;
  opponentScore: number;
  period: Periodo;
  onChangePeriod: () => void;
}

export function Scoreboard({ 
  myScore, 
  opponentScore, 
  period, 
  onChangePeriod 
}: ScoreboardProps) {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl mb-6">
      <div className="flex justify-between items-center text-center">
        
        <div className="flex-1">
          <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">
            Meu Time
          </div>
          <div className="text-5xl font-black text-green-400">
            {myScore}
          </div>
        </div>

        <div className="px-4">
          <button 
            onClick={onChangePeriod}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-sm font-mono border border-slate-600 transition-colors"
          >
            {period}º Q
          </button>
          <div className="text-[10px] text-slate-500 mt-1">PERÍODO</div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">
            Adversário
          </div>
          <div className="text-5xl font-black text-red-400">
            {opponentScore}
          </div>
        </div>

      </div>
    </div>
  );
}