// types/game.ts

// Aqui definimos os 4 quartos e a prorrogação (OT)
export type Periodo = 1 | 2 | 3 | 4 | 'OT';

// Aqui listamos todas as ações possíveis no jogo
export type TipoAcao = 
  | '1PT'       // Lance Livre
  | '2PT'       // 2 Pontos
  | '3PT'       // 3 Pontos
  | 'REB_DEF'   // Rebote Defensivo
  | 'REB_OFF'   // Rebote Ofensivo
  | 'AST'       // Assistência
  | 'STL'       // Roubo de bola
  | 'BLK'       // Toco
  | 'TO'        // Turnover (Erro)
  | 'FALTA';    // Falta Pessoal

export interface Jogador {
  id: string; 
  nome: string;
  numero: number;
  titular: boolean;
}

export interface LogAcao {
  id: string;
  jogadorId: string;
  tipo: TipoAcao;
  resultado: 'ACERTO' | 'ERRO' | 'NEUTRO';
  periodo: Periodo;
  timestamp: number;
}