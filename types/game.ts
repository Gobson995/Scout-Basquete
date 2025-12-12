export type Periodo = 1 | 2 | 3 | 4;

export type TipoAcao = 
  | '3PT' 
  | '2PT' 
  | '1PT' 
  | 'FALTA' 
  | 'REBOTE' 
  | 'ASSISTENCIA' 
  | 'TOCO' 
  | 'ROUBO';

export type ResultadoAcao = 'ACERTO' | 'ERRO' | 'NEUTRO';

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
  resultado: ResultadoAcao;
  periodo: Periodo;
  timestamp: number;
}

export type HistoricoItem = 
  | { tipo: 'JOGADOR'; logId: string }
  | { tipo: 'ADVERSARIO'; valor: number };