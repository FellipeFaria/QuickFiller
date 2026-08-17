import * as xlsx from 'xlsx';
import { ResultadoExtracao, HoleriteJSON, CartaoPontoJSON } from '../types/documentos';

export class ExcelService {
  public gerarExcel(dados: ResultadoExtracao, tipo: 'cartao-ponto' | 'holerite'): Buffer {
    const workbook = xlsx.utils.book_new();

    if (tipo === 'holerite') {
      const holerite = dados as HoleriteJSON;
      const linhasFields: any[] = [];
      const linhasBases: any[] = [];

      holerite.pages.forEach(page => {
        page.fields.forEach(field => {
          linhasFields.push({
            'Página': page.page,
            'Ano': page.year,
            'Mês': page.month,
            'Código': field.code || '-',
            'Descrição': field.label,
            'Referência': field.reference || '-',
            'Valor (R$)': field.value
          });
        });

        page.bases.forEach(base => {
          linhasBases.push({
            'Página': page.page,
            'Ano': page.year,
            'Mês': page.month,
            'Descrição': base.label,
            'Valor (R$)': base.value
          });
        });
      });

      const worksheetFields = xlsx.utils.json_to_sheet(linhasFields);
      const worksheetBases = xlsx.utils.json_to_sheet(linhasBases);

      xlsx.utils.book_append_sheet(workbook, worksheetFields, 'Verbas e Descontos');
      xlsx.utils.book_append_sheet(workbook, worksheetBases, 'Bases de Cálculo');

    } else {
      const cartao = dados as CartaoPontoJSON;
      const linhasPonto: any[] = [];

      cartao.pages.forEach(page => {
        page.days.forEach(day => {
          day.punches.forEach(punch => {
            linhasPonto.push({
              'Página': page.page,
              'Data': day.date_raw,
              'Tipo': punch.kind === 'IN' ? 'Entrada' : 'Saída',
              'Horário Registrado': punch.time_raw,
              'Horário Ajustado': punch.time_hhmm
            });
          });
        });
      });

      const worksheetPonto = xlsx.utils.json_to_sheet(linhasPonto);
      xlsx.utils.book_append_sheet(workbook, worksheetPonto, 'Marcações de Ponto');
    }

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}