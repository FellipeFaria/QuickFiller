import { GoogleGenAI } from "@google/genai";
import { ResultadoExtracao } from "../types/documentos";

export class GeminiService {
  private model: string = 'gemini-3.5-flash-lite';

  private getAIClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("A variável de ambiente GEMINI_API_KEY não está definida.");
    }

    return new GoogleGenAI({ apiKey: apiKey });
  }

  public async testarConexao() {
    try {
      console.log("[GeminiService] Testando a conexão coma nova API (genai)...");

      const ai = this.getAIClient();

      const response = await ai.interactions.create({
        model: this.model,
        input: "Responda exatamente com a frase: 'API configurada e pronta para o trabalho!'"
      })

      console.log("[GeminiService] Resposta da IA: ", response.output_text?.trim());
    } catch (error) {
      console.error("[GeminiService] Erro ao conectar com o novo SDK:", error);
    }
  }

  public async processarDocumento(
    fileBuffer: Buffer, 
    mimetype: string, 
    tipo: 'cartao-ponto' | 'holerite'
  ): Promise<ResultadoExtracao> {
    try {
      console.log(`[GeminiService] Analisando ${tipo} com o modelo ${this.model}...`);

      const ai = this.getAIClient();

      const arquivox64 = fileBuffer.toString('base64');

      const regrasGerais = `
        Você é um assistente especialista em extração de dados de documentos brasileiros de RH.
        Analise este arquivo PDF de um ${tipo === 'holerite' ? 'Holerite (Recibo de Pagamento de Salário)' : 'Cartão de Ponto'}.
        
        REGRAS OBRIGATÓRIAS:
        1. Retorne APENAS um objeto JSON válido, sem formatação markdown.
        2. Se você estiver em dúvida sobre qualquer caractere ou número, substitua por "?".
        3. Se um campo estiver em branco ou não existir, omita ou deixe nulo, não invente dados.
        4. O JSON deve seguir EXATAMENTE a estrutura exigida.
        5. RETORNE O JSON COMPLETAMENTE MINIFICADO. Não use NENHUMA quebra de linha, espaços em branco ou indentação. O JSON inteiro deve ser retornado em uma única linha contínua.de impostos/FGTS).
      `;

      let estruturaExigida = "";

      if (tipo === 'holerite') {
        estruturaExigida = `
          ESTRUTURA OBRIGATÓRIA PARA HOLERITE:
          {
            "pages": [
              {
                "page": 1,
                "year": "AAAA",
                "month": "MM",
                "fields": [
                  { "code": "0010", "label": "Nome da Verba/Desconto", "reference": "referência se houver", "value": "valor" }
                ],
                "bases": [
                  { "label": "Nome da Base (ex: Base INSS, Total Vencimentos, Valor Líquido)", "value": "valor" }
                ]
              }
            ]
          }`;
      } else {
        estruturaExigida = `
          ESTRUTURA OBRIGATÓRIA PARA CARTÃO DE PONTO:
          {
            "pages": [
              {
                "page": 1,
                "days": [
                  {
                    "date_raw": "DD/MM/AAAA",
                    "punches": [
                      { "kind": "IN ou OUT", "time_raw": "HH:MM", "time_hhmm": "HH:MM" }
                    ]
                  }
                ]
              }
            ]
          }`;
      }

      const promptFinal = regrasGerais + "\n" + estruturaExigida;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: [
          { text: promptFinal },
          { inlineData: { data: arquivox64, mimeType: mimetype } }
        ],
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          temperature: 0
        }
      });

      let textoResposta = response.text?.trim() || "{}";

      const jsonExtraido = JSON.parse(textoResposta) as ResultadoExtracao;

      console.log(`[GeminiService] Processamento finalizado com sucesso para o ID gerado!`)

      return jsonExtraido;
    } catch (error) {
      console.error("[GeminiService] Erro ao processar o documento: ", error);
      throw error;
    }
  }
}