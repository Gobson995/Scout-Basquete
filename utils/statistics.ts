import { LogAcao, Jogador, Periodo } from "../types/game";

export interface PlayerStats {
  nome: string;
  numero: number;
  pontos: number;
  rebotes: number;
  rebotesDef: number;
  rebotesOf: number;
  assistencias: number;
  faltas: number;
  fgMade: number; 
  fgAttempt: number;
  threeMade: number; 
  threeAttempt: number;
  ftMade: number; 
  ftAttempt: number;
}

export function calcularEstatisticas(jogador: Jogador, logs: LogAcao[]): PlayerStats {
  const acoes = logs.filter(log => log.jogadorId === jogador.id);

  const stats: PlayerStats = {
    nome: jogador.nome,
    numero: jogador.numero,
    pontos: 0,
    rebotes: 0,
    rebotesDef: 0,
    rebotesOf: 0,
    assistencias: 0,
    faltas: 0,
    fgMade: 0, fgAttempt: 0,
    threeMade: 0, threeAttempt: 0,
    ftMade: 0, ftAttempt: 0
  };

  acoes.forEach(acao => {
    if (acao.tipo === '1PT') {
      stats.ftAttempt++;
      if (acao.resultado === 'ACERTO') {
        stats.ftMade++;
        stats.pontos += 1;
      }
    }
    
    else if (acao.tipo === '2PT') {
      stats.fgAttempt++;
      if (acao.resultado === 'ACERTO') {
        stats.fgMade++;
        stats.pontos += 2;
      }
    }

    else if (acao.tipo === '3PT') {
      stats.fgAttempt++;
      stats.threeAttempt++;
      
      if (acao.resultado === 'ACERTO') {
        stats.fgMade++;
        stats.threeMade++;
        stats.pontos += 3;
      }
    }

    else if (acao.tipo === 'REBOTE_DEF') {
      stats.rebotesDef++;
      stats.rebotes++;
    }
    else if (acao.tipo === 'REBOTE_OF') {
      stats.rebotesOf++;
      stats.rebotes++;
    }
    else if (acao.tipo === 'ASSISTENCIA') {
      stats.assistencias++;
    }
    else if (acao.tipo === 'FALTA') {
      stats.faltas++;
    }
  });

  return stats;
}

export function calcularPontosPorQuarto(jogador: Jogador, logs: LogAcao[]) {
  const porQuarto: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  
  logs
    .filter(l => l.jogadorId === jogador.id && l.resultado === 'ACERTO')
    .forEach(l => {
      let pts = 0;
      if (l.tipo === '1PT') pts = 1;
      else if (l.tipo === '2PT') pts = 2;
      else if (l.tipo === '3PT') pts = 3;
      
      if (porQuarto[l.periodo] !== undefined) {
        porQuarto[l.periodo] += pts;
      }
    });

  return porQuarto;
}