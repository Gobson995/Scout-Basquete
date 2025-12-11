import React from 'react';
import { Jogador } from '@/types/game';
import { ButtonAction } from './ButtonAction';
import { CircleCheck, XCircle, Hand, Users, Shield, Zap } from 'lucide-react';

interface ActionMenuProps {
  player: Jogador;
  onAction: (tipo: string, resultado: 'ACERTO' | 'ERRO' | 'NEUTRO', pontos: number) => void;
  onClose: () => void;
}

export function ActionMenu({ player, onAction, onClose }: ActionMenuProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animation-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 relative animate-slide-up pb-8">
        
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
              {player.numero}
            </span>
            <span className="font-bold text-lg">{player.nome}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 text-sm">Cancelar</button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <ButtonAction 
              label="3 PONTOS" 
              variant="success" 
              icon={CircleCheck}
              onClick={() => onAction('3PT', 'ACERTO', 3)} 
            />
            <ButtonAction 
              label="ERROU 3PT" 
              variant="danger" 
              icon={XCircle}
              onClick={() => onAction('3PT', 'ERRO', 0)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ButtonAction 
              label="2 PONTOS" 
              variant="success" 
              icon={CircleCheck}
              onClick={() => onAction('2PT', 'ACERTO', 2)} 
            />
            <ButtonAction 
              label="ERROU 2PT" 
              variant="danger" 
              icon={XCircle}
              onClick={() => onAction('2PT', 'ERRO', 0)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ButtonAction 
              label="LANCE LIVRE" 
              variant="success" 
              icon={CircleCheck}
              onClick={() => onAction('1PT', 'ACERTO', 1)} 
            />
            <ButtonAction 
              label="ERROU LL" 
              variant="danger" 
              icon={XCircle}
              onClick={() => onAction('1PT', 'ERRO', 0)} 
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-2">
            <ButtonAction label="REBOTE" variant="neutral" icon={Hand} onClick={() => onAction('REB_DEF', 'NEUTRO', 0)} />
            <ButtonAction label="ASSIST" variant="neutral" icon={Zap} onClick={() => onAction('AST', 'NEUTRO', 0)} />
            <ButtonAction label="FALTA" variant="outline" icon={Users} onClick={() => onAction('FALTA', 'NEUTRO', 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}