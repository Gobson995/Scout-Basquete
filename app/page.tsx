'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileDown, Trash2, Undo2 } from "lucide-react";
import { Scoreboard } from "./components/Scoreboard";
import { PlayerManager } from "./components/PlayerManager";
import { ActionMenu } from "./components/ActionMenu";
import { Periodo, Jogador, LogAcao, TipoAcao } from "../types/game";
import { gerarPDF } from "../utils/pdfGenerator";

// --- TIPOS PARA O HISTÓRICO GLOBAL ---
// Isso permite saber se a última ação foi do Jogador ou do Placar Adversário
type HistoricoItem = 
  | { tipo: 'JOGADOR'; logId: string }
  | { tipo: 'ADVERSARIO'; valor: number };

interface GameState {
  jogadores: Jogador[];
  logs: LogAcao[];
  historico: HistoricoItem[]; // NOVO: Guarda a ordem dos fatos
  placarAdv: number;
  periodo: Periodo;
}

const INITIAL_STATE: GameState = {
  jogadores: [],
  logs: [],
  historico: [],
  placarAdv: 0,
  periodo: 1
};

// --- HOOK DE LÓGICA (CONTROLADOR) ---
function useGameScout() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [isReady, setIsReady] = useState(false);
  const isFirstRender = useRef(true);

  // 1. CARREGAR
  useEffect(() => {
    const timer = setTimeout(() => {
        const dadosSalvos = localStorage.getItem('scout_backup_v1');
        if (dadosSalvos) {
          try {
            const parsed = JSON.parse(dadosSalvos);
            setGame({
              jogadores: Array.isArray(parsed.jogadores) ? parsed.jogadores : [],
              logs: Array.isArray(parsed.logs) ? parsed.logs : [],
              historico: Array.isArray(parsed.historico) ? parsed.historico : [], // Carrega histórico
              placarAdv: typeof parsed.placarAdv === 'number' ? parsed.placarAdv : 0,
              periodo: parsed.periodo || 1
            });
          } catch (e) {
            console.error("Erro ao carregar save:", e);
          }
        }
        setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. SALVAR
  useEffect(() => {
    if (!isReady) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const backup = { 
      jogadores: game.jogadores, 
      logs: game.logs, 
      historico: game.historico, // Salva histórico
      placarAdv: game.placarAdv, 
      periodo: game.periodo 
    };
    localStorage.setItem('scout_backup_v1', JSON.stringify(backup));
  }, [game, isReady]); 

  // --- LÓGICA DE NEGÓCIO ---
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
    if (window.confirm("Tem certeza?")) {
      setGame(prev => ({ 
        ...prev, 
        jogadores: prev.jogadores.filter(j => j.id !== id) 
      }));
    }
  };

  // Registra ação do MEU time e adiciona no histórico global
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

  // Registra pontos do ADVERSÁRIO e adiciona no histórico global
  const incrementarPlacarAdv = (pontos: number) => {
    setGame(prev => ({ 
      ...prev, 
      placarAdv: prev.placarAdv + pontos,
      historico: [...prev.historico, { tipo: 'ADVERSARIO', valor: pontos }]
    }));
  };

  // --- NOVA LÓGICA DE DESFAZER INTELIGENTE ---
  const desfazerUltimaAcao = () => {
    setGame(prev => {
      if (prev.historico.length === 0) return prev; // Nada para desfazer

      const novoHistorico = [...prev.historico];
      const ultimoEvento = novoHistorico.pop(); // Pega e remove o último evento

      // CASO 1: A última ação foi de um JOGADOR (Meu time)
      if (ultimoEvento?.tipo === 'JOGADOR') {
        return {
          ...prev,
          historico: novoHistorico,
          logs: prev.logs.filter(log => log.id !== ultimoEvento.logId) // Remove o log específico
        };
      } 
      
      // CASO 2: A última ação foi PONTO DO ADVERSÁRIO
      else if (ultimoEvento?.tipo === 'ADVERSARIO') {
        return {
          ...prev,
          historico: novoHistorico,
          placarAdv: Math.max(0, prev.placarAdv - ultimoEvento.valor) // Subtrai os pontos exatos
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
    if (window.confirm("Deseja iniciar um novo jogo?")) {
      localStorage.removeItem('scout_backup_v1');
      setGame(INITIAL_STATE);
    }
  };

  return {
    state: { ...game, placarMeus, isReady },
    actions: { 
      adicionarJogador, 
      removerJogador, 
      registrarAcao, 
      desfazerUltimaAcao, 
      trocarQuarto, 
      incrementarPlacarAdv, 
      resetarJogo 
    }
  };
}

// --- COMPONENTE VISUAL ---
export default function ScoutPage() {
  const { state, actions } = useGameScout();
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);

  const handleDownload = () => {
    if (state.logs.length === 0) {
      alert("Sem dados para gerar relatório.");
      return;
    }
    gerarPDF(state.jogadores, state.logs, state.placarMeus, state.placarAdv);
  };

  const handleAction = (tipo: string, resultado: 'ACERTO' | 'ERRO' | 'NEUTRO') => {
    if (jogadorSelecionado) {
      actions.registrarAcao(jogadorSelecionado.id, tipo, resultado);
      setJogadorSelecionado(null);
    }
  };

  if (!state.isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-400 font-medium">
        Carregando...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-32 font-sans text-slate-800">
      
      <div className="max-w-md mx-auto p-4 flex flex-col h-full">
        
        <header className="mb-4">
          <Scoreboard 
            myScore={state.placarMeus} 
            opponentScore={state.placarAdv} 
            period={state.periodo}
            onChangePeriod={actions.trocarQuarto}
          />
        </header>

        <section aria-label="Jogadores">
          <div className="mb-2 flex justify-between items-end px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jogadores</h2>
            <span className="text-[10px] text-slate-400">Toque para pontuar</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {state.jogadores.map(jogador => {
              const acertos = state.logs.filter(l => l.jogadorId === jogador.id && l.resultado === 'ACERTO').length;
              
              return (
                <button
                  key={jogador.id}
                  onClick={() => setJogadorSelecionado(jogador)}
                  className="group relative bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 transition-all active:scale-95 hover:border-blue-400 hover:shadow-md"
                >
                  <span className="bg-slate-800 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg shadow-sm group-hover:bg-blue-600 transition-colors">
                    {jogador.numero}
                  </span>
                  <div className="text-left overflow-hidden w-full">
                    <div className="font-bold text-slate-800 truncate text-sm">{jogador.nome}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {acertos} {acertos === 1 ? 'pt' : 'pts'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <PlayerManager 
            players={state.jogadores}
            onAddPlayer={actions.adicionarJogador}
            onRemovePlayer={actions.removerJogador}
          />
        </section>

        <section aria-label="Adversário" className="mt-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-3 text-center tracking-wide">
              Placar Adversário
            </h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((val) => (
                <button 
                  key={val}
                  onClick={() => actions.incrementarPlacarAdv(val)} 
                  className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-lg border border-red-100 active:bg-red-100 transition-colors hover:bg-red-100"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-10">
        <div className="max-w-md mx-auto flex gap-3 justify-center items-center">
          
          <button
            onClick={actions.resetarJogo}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-red-500 px-3 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Resetar"
          >
            <Trash2 size={20} />
            <span className="text-[10px] font-bold mt-1">Reset</span>
          </button>

          <button
            onClick={actions.desfazerUltimaAcao}
            disabled={state.historico.length === 0} // Desabilita se não tiver histórico
            className={`flex flex-col items-center justify-center px-3 transition-colors p-2 rounded-lg
              ${state.historico.length === 0 ? 'text-slate-300' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'}
            `}
            title="Desfazer última ação"
          >
            <Undo2 size={24} />
            <span className="text-[10px] font-bold mt-1">Desfazer</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-slate-900 text-white flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            <FileDown size={20} />
            <span>Baixar PDF</span>
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
    </main>
  );
}