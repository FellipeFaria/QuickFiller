import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ITranscricao } from '../database/memory';

export class  TranscricaoController {
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

      res.status(202).json({ id });
    } catch (error: any) {
      res.status(400).json({ erro: error.message || 'Erro interno ao processar a requisição.' });
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