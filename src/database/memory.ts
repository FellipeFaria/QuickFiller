export type StatusTranscricao = 'processando' | 'concluido' | 'erro';

export interface ITranscricao {
  id: string;
  tipo: "cartao-ponto" | "holerite";
  status: StatusTranscricao;
  erro: string | null;
  value: any | null;
}

export const db = new Map<string, ITranscricao>();