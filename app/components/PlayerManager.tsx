import React, { useState } from 'react';
import { Jogador } from '@/types/game';
import { Plus, Trash2, User } from 'lucide-react';

interface PlayerManagerProps {
  players: Jogador[];
  onAddPlayer: (nome: string, numero: number) => void;
  onRemovePlayer: (id: string) => void;
}

export function PlayerManager({ players, onAddPlayer, onRemovePlayer }: PlayerManagerProps) {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');

  const handleAdd = () => {
    if (!nome || !numero) return;
    onAddPlayer(nome, parseInt(numero));
    setNome('');
    setNumero('');
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h2 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
        <User size={16} />
        Elenco (Meu Time)
      </h2>

      <div className="flex gap-2 mb-4">
        <input 
          type="number" 
          placeholder="#" 
          className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold"
          value={numero}
          onChange={e => setNumero(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Nome do Jogador" 
          className="flex-1 p-2 border border-slate-300 rounded-lg"
          value={nome}
          onChange={e => setNome(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-2">
        {players.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-2">
            Nenhum jogador adicionado.
          </div>
        )}

        {players.map(player => (
          <div key={player.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="bg-slate-800 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                {player.numero}
              </span>
              <span className="font-medium text-slate-700">{player.nome}</span>
            </div>
            <button 
              onClick={() => onRemovePlayer(player.id)}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}