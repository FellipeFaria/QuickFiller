import { ResultadoExtracao } from "../types/documentos";

export type StatusTranscricao = 'processando' | 'concluido' | 'erro';

export interface ITranscricao {
  id: string;
  tipo: "cartao-ponto" | "holerite";
  status: StatusTranscricao;
  erro: string | null;
  value: ResultadoExtracao | null;
}

export const db = new Map<string, ITranscricao>();