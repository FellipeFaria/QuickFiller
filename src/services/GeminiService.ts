import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("A variável de ambiente GEMINI_API_KEY não está definida.");
    }

    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.model = 'gemini-3.6-flash';
  }

  public async testarConexao() {
    try {
      console.log("[GeminiService] Testando a conexão coma nova API (genai)...");

      const response = await this.ai.interactions.create({
        model: this.model,
        input: "Responda exatamente com a frase: 'API configurada e pronta para o trabalho!'"
      })

      console.log("[GeminiService] Resposta da IA: ", response.output_text?.trim());
    } catch (error) {
      console.error("[GeminiService] Erro ao conectar com o novo SDK:", error);
    }
  }
}