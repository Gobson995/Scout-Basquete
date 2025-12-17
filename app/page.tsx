'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileDown, Trash2, Undo2, UserPlus, Users, Trophy } from "lucide-react";
import { Scoreboard } from "./components/Scoreboard";
import { PlayerManager } from "./components/PlayerManager";
import { ActionMenu } from "./components/ActionMenu";
import { Periodo, Jogador, LogAcao, GameState, TipoAcao } from "../types/game"; 
import { gerarPDF } from "../utils/pdfGenerator";

const INITIAL_STATE: GameState = {
  jogadores: [],
  logs: [],
  historico: [],
  placarAdversario: 0,
  periodo: 1,
  info: {
    timeCasa: "Meu Time",
    timeAdversario: "Visitante",
    campeonato: "Amistoso",
    data: new Date().toISOString().split('T')[0]
  }
};

function useGameScout() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [isReady, setIsReady] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        const dadosSalvos = localStorage.getItem('scout_backup_v1');
        if (dadosSalvos) {
          try {
            const parsed = JSON.parse(dadosSalvos);
            setGame({
              jogadores: Array.isArray(parsed.jogadores) ? parsed.jogadores : [],
              logs: Array.isArray(parsed.logs) ? parsed.logs : [],
              historico: Array.isArray(parsed.historico) ? parsed.historico : [],
              placarAdversario: parsed.placarAdversario || parsed.placarAdv || 0,
              periodo: parsed.periodo || 1,
              info: parsed.info || INITIAL_STATE.info
            });
          } catch (e) { console.error("Erro ao carregar:", e); }
        }
        setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    localStorage.setItem('scout_backup_v1', JSON.stringify(game));
  }, [game, isReady]); 

  const atualizarInfo = (campo: keyof GameState['info'], valor: string) => {
    setGame(prev => ({
      ...prev,
      info: { ...prev.info, [campo]: valor }
    }));
  };

  const placarMeus = game.logs.reduce((total, acao) => {
    if (acao.resultado === 'ACERTO') {
      if (acao.tipo === '3PT') return total + 3;
      if (acao.tipo === '2PT') return total + 2;
      if (acao.tipo === '1PT') return total + 1;
    }
    return total;
  }, 0);

  const adicionarJogador = (nome: string, numero: number) => {
    const novo: Jogador = { id: uuidv4(), nome, numero, titular: false };
    setGame(prev => ({ ...prev, jogadores: [...prev.jogadores, novo] }));
  };

  const removerJogador = (id: string) => {
    if (window.confirm("Remover jogador?")) {
      setGame(prev => ({ ...prev, jogadores: prev.jogadores.filter(j => j.id !== id) }));
    }
  };

  const registrarAcao = (jogadorId: string, tipo: string, resultado: 'ACERTO' | 'ERRO' | 'NEUTRO') => {
    const novaAcao: LogAcao = {
      id: uuidv4(),
      jogadorId,
      tipo: tipo as TipoAcao, 
      resultado,
      periodo: game.periodo,
      timestamp: Date.now()
    };
    
    setGame(prev => ({ 
      ...prev, 
      logs: [...prev.logs, novaAcao],
      historico: [...prev.historico, { tipo: 'JOGADOR', logId: novaAcao.id }]
    }));
  };

  const incrementarPlacarAdv = (pontos: number) => {
    setGame(prev => ({ 
      ...prev, 
      placarAdversario: prev.placarAdversario + pontos,
      historico: [...prev.historico, { tipo: 'ADVERSARIO', valor: pontos }]
    }));
  };

  const desfazerUltimaAcao = () => {
    setGame(prev => {
      if (prev.historico.length === 0) return prev;
      const novoHistorico = [...prev.historico];
      const ultimoEvento = novoHistorico.pop();

      if (ultimoEvento?.tipo === 'JOGADOR') {
        return { 
          ...prev, 
          historico: novoHistorico, 
          logs: prev.logs.filter(log => log.id !== ultimoEvento.logId) 
        };
      } else if (ultimoEvento?.tipo === 'ADVERSARIO') {
        return { 
          ...prev, 
          historico: novoHistorico, 
          placarAdversario: Math.max(0, prev.placarAdversario - ultimoEvento.valor) 
        };
      }
      return prev;
    });
  };

  const trocarQuarto = () => {
    setGame(prev => {
      let novoPeriodo: Periodo = 1;
      if (prev.periodo === 1) novoPeriodo = 2;
      else if (prev.periodo === 2) novoPeriodo = 3;
      else if (prev.periodo === 3) novoPeriodo = 4;
      return { ...prev, periodo: novoPeriodo };
    });
  };

  const resetarJogo = () => {
    if (window.confirm("Reiniciar jogo? Todos os dados serão perdidos.")) {
      localStorage.removeItem('scout_backup_v1');
      setGame(INITIAL_STATE);
    }
  };

  return { 
    state: { ...game, placarMeus, isReady }, 
    actions: { 
      adicionarJogador, removerJogador, registrarAcao, 
      desfazerUltimaAcao, trocarQuarto, incrementarPlacarAdv, 
      resetarJogo, atualizarInfo 
    } 
  };
}

export default function ScoutPage() {
  const { state, actions } = useGameScout();
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);
  const [showPlayerManager, setShowPlayerManager] = useState(false);

  const handleDownload = () => {
    if (state.logs.length === 0) { alert("Sem dados."); return; }
    gerarPDF(state.jogadores, state.logs, state.placarMeus, state.placarAdversario, state.info);
  };

  const handleAction = (tipo: string, resultado: 'ACERTO' | 'ERRO' | 'NEUTRO') => {
    if (jogadorSelecionado) {
      actions.registrarAcao(jogadorSelecionado.id, tipo, resultado);
      setJogadorSelecionado(null);
    }
  };

  if (!state.isReady) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <div className="bg-slate-900 pb-8 pt-4 px-4 rounded-b-[2rem] shadow-xl mb-6">
        <div className="max-w-md mx-auto">
          
          {/* PAINEL DE EDIÇÃO DE INFO */}
          <div className="bg-slate-800/50 p-3 rounded-xl mb-4 border border-slate-700">
             <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                   <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Campeonato</label>
                   <input 
                      type="text" 
                      value={state.info.campeonato}
                      onChange={(e) => actions.atualizarInfo('campeonato', e.target.value)}
                      className="w-full bg-slate-900 text-white text-sm p-2 rounded border border-slate-600 focus:border-orange-500 outline-none"
                   />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Seu Time</label>
                   <input 
                      type="text" 
                      value={state.info.timeCasa}
                      onChange={(e) => actions.atualizarInfo('timeCasa', e.target.value)}
                      className="w-full bg-slate-900 text-blue-100 font-bold text-sm p-2 rounded border border-slate-600 focus:border-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="text-[10px] text-red-300 uppercase font-bold tracking-wider">Adversário</label>
                   <input 
                      type="text" 
                      value={state.info.timeAdversario}
                      onChange={(e) => actions.atualizarInfo('timeAdversario', e.target.value)}
                      className="w-full bg-slate-900 text-red-100 font-bold text-sm p-2 rounded border border-slate-600 focus:border-red-500 outline-none"
                   />
                </div>
             </div>
          </div>

          <div className="text-white">
             <Scoreboard 
                myScore={state.placarMeus} 
                opponentScore={state.placarAdversario} 
                period={state.periodo}
                onChangePeriod={actions.trocarQuarto}
             />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
               <Trophy size={14} /> Pontuar Adversário
             </h3>
          </div>
          <div className="flex gap-3">
             {[1, 2, 3].map(pts => (
               <button
                 key={pts}
                 onClick={() => actions.incrementarPlacarAdv(pts)}
                 className="flex-1 h-14 bg-red-50 text-red-600 rounded-xl font-black text-xl border-2 border-transparent active:border-red-200 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
               >
                 +{pts}
               </button>
             ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Meu Time
            </h3>
            <button 
              onClick={() => setShowPlayerManager(!showPlayerManager)}
              className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg active:bg-blue-100 transition-colors"
            >
              <UserPlus size={14} /> {showPlayerManager ? 'Fechar Gestão' : 'Gerenciar'}
            </button>
          </div>

          {showPlayerManager && (
            <div className="mb-4 bg-slate-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
               <PlayerManager 
                  players={state.jogadores}
                  onAddPlayer={actions.adicionarJogador}
                  onRemovePlayer={actions.removerJogador}
               />
            </div>
          )}
          
          {state.jogadores.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400">
               <p>Nenhum jogador cadastrado.</p>
               <p className="text-xs mt-1">Toque em Gerenciar para adicionar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {state.jogadores.map(jogador => {
                const pontos = state.logs
                  .filter(l => l.jogadorId === jogador.id && l.resultado === 'ACERTO')
                  .reduce((acc, curr) => {
                    if (curr.tipo === '3PT') return acc + 3;
                    if (curr.tipo === '2PT') return acc + 2;
                    return acc + 1;
                  }, 0);

                const faltas = state.logs.filter(l => l.jogadorId === jogador.id && l.tipo === 'FALTA').length;

                return (
                  <button
                    key={jogador.id}
                    onClick={() => setJogadorSelecionado(jogador)}
                    className={`
                      relative flex flex-col p-3 rounded-2xl border-2 transition-all active:scale-95 shadow-sm hover:shadow-md bg-white text-left
                      ${faltas >= 4 ? 'border-red-100 bg-red-50' : 'border-transparent'}
                    `}
                  >
                    <div className="flex justify-between items-start w-full mb-2">
                       <span className={`
                         text-lg font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm
                         ${faltas >= 5 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700'}
                       `}>
                         {jogador.numero}
                       </span>
                       <div className="text-right">
                         <span className="block text-2xl font-bold text-slate-800 leading-none">{pontos}</span>
                         <span className="text-[10px] text-slate-400 uppercase font-bold">PTS</span>
                       </div>
                    </div>
                    
                    <div className="w-full overflow-hidden">
                       <p className="font-bold text-slate-700 truncate text-sm">{jogador.nome}</p>
                       {faltas > 0 && (
                         <p className="text-[10px] text-red-500 font-bold mt-1">{faltas} Faltas</p>
                       )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-2 shadow-2xl flex items-center justify-between border border-slate-700/50">
           
           <button 
             onClick={actions.resetarJogo}
             className="flex flex-col items-center justify-center w-16 h-14 rounded-xl active:bg-white/10 transition-colors text-slate-400 hover:text-red-400"
           >
             <Trash2 size={20} />
             <span className="text-[9px] mt-1 font-bold">Reset</span>
           </button>

           <div className="h-8 w-[1px] bg-slate-700"></div>

           <button 
             onClick={actions.desfazerUltimaAcao}
             disabled={state.historico.length === 0}
             className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl active:bg-white/10 transition-colors
               ${state.historico.length === 0 ? 'opacity-30' : 'opacity-100 text-blue-400'}
             `}
           >
             <Undo2 size={24} />
             <span className="text-[9px] mt-1 font-bold">Desfazer</span>
           </button>

           <button 
             onClick={handleDownload}
             className="ml-2 flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
           >
             <FileDown size={18} />
             <span>PDF</span>
           </button>
        </div>
      </div>

      {jogadorSelecionado && (
        <ActionMenu 
          player={jogadorSelecionado}
          onAction={handleAction}
          onClose={() => setJogadorSelecionado(null)}
        />
      )}
    </div>
  );
}