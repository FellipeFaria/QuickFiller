export interface CampoHolerite {
  code: string;
  label: string;
  reference: string;
  value: string;
}

export interface BaseHolerite {
  label: string;
  value: string;
}

export interface PaginaHolerite {
  page: number;
  year: string;
  month: string;
  fields: CampoHolerite[];
  bases: BaseHolerite[];
}

export interface HoleriteJSON {
  pages: PaginaHolerite[];
}

export interface MarcacaoPonto {
  kind: 'IN' | 'OUT';
  time_raw: string;
  time_hhmm: string;
}

export interface DiaPonto {
  date_raw: string;
  punches: MarcacaoPonto[];
}

export interface PaginaCartaoPonto {
  page: number;
  days: DiaPonto[];
}

export interface CartaoPontoJSON {
  pages: PaginaCartaoPonto[];
}

export type ResultadoExtracao = HoleriteJSON | CartaoPontoJSON;