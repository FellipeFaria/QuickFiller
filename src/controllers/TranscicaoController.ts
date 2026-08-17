import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ITranscricao } from '../database/memory';
import { GeminiService } from '../services/GeminiService';
import { ExcelService } from '../services/ExcelService';

export class  TranscricaoController {
  constructor(
    private geminiService: GeminiService,
    private excelService: ExcelService
  ) {}

  public upload = (req: Request, res: Response): void => {
    try {
      const { tipo } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ erro: "O campo 'arquivo' (PDF) é obrigatório." });
        return;
      }

      if (tipo !== "cartao-ponto" && tipo !== "holerite") {
        res.status(400).json({ erro: 'O campo "tipo" deve ser "cartao-ponto" ou "holerite".' });
        return;
      }

      const id = uuidv4();

      const novoRegistro: ITranscricao = {
        id,
        tipo,
        status: "processando",
        erro: null,
        value: null
      };

      db.set(id, novoRegistro);

      this.geminiService.processarDocumento(file.buffer, file.mimetype, tipo)
        .then((resultJson) => {
          const registroAtual = db.get(id);

          if (registroAtual) {
            db.set(id, { ...registroAtual, status: 'concluido', value: resultJson });
            console.log(`[Controller] Transcrição ${id} concluída e salva!`);
          }
        })
        .catch((erroDaIA) => {
          const registroAtual = db.get(id);
          if (registroAtual) {
            db.set(id, { ...registroAtual, status: 'erro', erro: erroDaIA.message });
            console.log(`[Controller] Transcrição ${id} falhou.`);
          }
        });

      res.status(202).json({ id });
    } catch (error: any) {
      res.status(400).json({ erro: error.message || 'Erro interno ao processar a requisição.' });
    }
  }

  public update = (req: Request, res: Response): void => {
    try {
      const id = req.params.id as string;
      const novoValor = req.body;

      if (!novoValor || Object.keys(novoValor).length === 0) {
        res.status(400).json({ erro: "O corpo da requisição não pode estar vazio." });
        return;
      }

      const registro = db.get(id);

      if (!registro) {
        res.status(404).json({ erro: "Transcrição não encontrada." });
        return;
      }

      const registroAtualizado = {
        ...registro,
        value: novoValor
      };

      db.set(id, registroAtualizado);

      console.log(`[Controller] Transcrição ${id} editada com sucesso!`);

      res.status(200).json(registroAtualizado);
    } catch (error: any) {
      res.status(500).json({ erro: error.message || 'Erro interno ao atualizar a transcrição.' });
    }
  }

  public download = (req: Request, res: Response): void => {
    try {
      const id = req.params.id as string;
      const registro = db.get(id);

      if (!registro) {
        res.status(404).json({ erro: "Transcrição não encontrada." });
        return;
      }

      if (registro.status !== 'concluido' || !registro.value) {
        res.status(400).json({ erro: "O documento ainda está sendo processado ou falhou. Tente novamente mais tarde." });
        return;
      }

      const bufferPlanilha = this.excelService.gerarExcel(registro.value, registro.tipo);

      res.setHeader('Content-Disposition', `attachment; filename=${registro.tipo}-${id}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(bufferPlanilha);
    } catch(error: any) {
      res.status(500).json({ erro: error.message || 'Erro interno ao gerar o arquivo Excel.' });
    }
  }

  public getStatus = (req: Request, res: Response): void => {
    const id = req.params.id as string;

    const registro = db.get(id);

    if (!registro) {
      res.status(404).json({ erro: "Transcricao não encontrada" });
      return;
    }

    res.status(200).json(registro);
  }
}