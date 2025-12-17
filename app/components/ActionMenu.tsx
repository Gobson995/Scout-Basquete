import { X } from "lucide-react";
import { Jogador } from "../../types/game";

interface ActionMenuProps {
  player: Jogador;
  onAction: (tipo: string, resultado: 'ACERTO' | 'ERRO' | 'NEUTRO') => void;
  onClose: () => void;
}

export function ActionMenu({ player, onAction, onClose }: ActionMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-lg">
              {player.numero}
            </span>
            <div>
              <p className="text-white font-bold text-lg leading-none">{player.nome}</p>
              <p className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wider">Selecione a ação</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
          
          <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-1">Pontuação</div>
          
          <div className="grid grid-cols-2 gap-2 col-span-2">
            <button onClick={() => onAction('3PT', 'ACERTO')} className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg shadow-sm active:scale-95 transition-all">
              +3 PONTOS
            </button>
            <button onClick={() => onAction('3PT', 'ERRO')} className="h-12 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all">
              ERROU 3PT
            </button>

            <button onClick={() => onAction('2PT', 'ACERTO')} className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg shadow-sm active:scale-95 transition-all">
              +2 PONTOS
            </button>
            <button onClick={() => onAction('2PT', 'ERRO')} className="h-12 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all">
              ERROU 2PT
            </button>

            <button onClick={() => onAction('1PT', 'ACERTO')} className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg shadow-sm active:scale-95 transition-all">
              +1 PONTO
            </button>
            <button onClick={() => onAction('1PT', 'ERRO')} className="h-12 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all">
              ERROU 1PT
            </button>
          </div>

          <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">Fundamentos</div>

          <button onClick={() => onAction('REBOTE_DEF', 'NEUTRO')} className="h-12 bg-blue-100 text-blue-700 font-bold rounded-xl active:scale-95 transition-all text-xs">
            REBOTE DEF
          </button>
          <button onClick={() => onAction('REBOTE_OF', 'NEUTRO')} className="h-12 bg-blue-100 text-blue-700 font-bold rounded-xl active:scale-95 transition-all text-xs">
            REBOTE OF
          </button>
          
          <button onClick={() => onAction('ASSISTENCIA', 'NEUTRO')} className="h-12 bg-blue-100 text-blue-700 font-bold rounded-xl active:scale-95 transition-all text-xs">
            ASSISTÊNCIA
          </button>
          <button onClick={() => onAction('ROUBO', 'NEUTRO')} className="h-12 bg-purple-100 text-purple-700 font-bold rounded-xl active:scale-95 transition-all text-xs">
            ROUBO BOLA
          </button>
          
          <button onClick={() => onAction('TOCO', 'NEUTRO')} className="h-12 bg-purple-100 text-purple-700 font-bold rounded-xl active:scale-95 transition-all text-xs">
            TOCO
          </button>
          <button onClick={() => onAction('TURNOVER', 'ERRO')} className="h-12 bg-red-500 text-white font-bold rounded-xl active:scale-95 transition-all text-xs">
            ERRO / PERDA
          </button>

          <div className="col-span-2 mt-1">
            <button onClick={() => onAction('FALTA', 'NEUTRO')} className="w-full h-10 bg-orange-100 text-orange-700 font-bold rounded-xl border-2 border-orange-200 active:scale-95 transition-all hover:bg-orange-200 text-xs">
              MARCAR FALTA
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}