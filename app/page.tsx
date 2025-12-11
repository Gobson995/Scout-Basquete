'use client';

import { useState } from 'react';
import { ButtonAction } from "./components/ButtonAction";
import { Scoreboard } from "./components/Scoreboard";
import { Periodo } from "../types/game";
import { CircleCheck, XCircle, Hand, Users } from "lucide-react";

export default function Home() {
  const [pontosMeus, setPontosMeus] = useState(0);
  const [pontosAdv, setPontosAdv] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>(1);

  const trocarQuarto = () => {
    if (periodo === 1) setPeriodo(2);
    else if (periodo === 2) setPeriodo(3);
    else if (periodo === 3) setPeriodo(4);
    else setPeriodo(1);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 max-w-md mx-auto flex flex-col">

      <Scoreboard 
        myScore={pontosMeus} 
        opponentScore={pontosAdv} 
        period={periodo}
        onChangePeriod={trocarQuarto}
      />

      <div className="mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Adicionar ao Adversário</h2>
        <div className="flex gap-2">
          <button onClick={() => setPontosAdv(p => p + 1)} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200">+1</button>
          <button onClick={() => setPontosAdv(p => p + 2)} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200">+2</button>
          <button onClick={() => setPontosAdv(p => p + 3)} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200">+3</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ButtonAction 
          label="3 PONTOS" 
          variant="success" 
          icon={CircleCheck}
          onClick={() => setPontosMeus(p => p + 3)} 
        />
        <ButtonAction 
          label="ERROU 3PT" 
          variant="danger" 
          icon={XCircle}
          onClick={() => alert('Registrar erro...')} 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ButtonAction 
          label="REBOTE" 
          variant="neutral"
          icon={Hand}
          onClick={() => alert('Rebote!')} 
        />
        <ButtonAction 
          label="FALTA" 
          variant="outline"
          icon={Users}
          onClick={() => alert('Falta!')} 
        />
      </div>

    </main>
  );
}