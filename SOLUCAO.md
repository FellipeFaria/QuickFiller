# Decisões de Arquitetura e Solução

Este documento detalha as escolhas técnicas adotadas para suprir os requisitos do desafio Quick Filler.

## 1. Escolha da Ferramenta de OCR

Em vez de utilizar uma camada tradicional de extração de texto embutido (que falha em documentos escaneados) ou o Tesseract OCR (que exige alto processamento computacional de configuração complexa), optei por utilizar as **capacidades multimodais nativas do Google Gemini (modelo \`gemini-3.6-flash\`)**.

A API da Google consegue receber o binário base64 do PDF inteiro e realizar a extração visual e semântica simultaneamente, lidando com tabelas tortas, documentos escaneados e manchas, convertendo diretamente para a estrutura JSON exigida via "Few-Shot Prompting" e modo \`application/json\`.

## 2. Processamento Assíncrono (Fire-and-Forget)

O processamento de IA é inerentemente demorado. Para respeitar o contrato de devolver um \`202 Accepted\` imediato, o Controller do Express inicia a chamada para o \`GeminiService\` sem a palavra-chave \`await\`. Isso libera a rota principal na hora, enquanto a Promise da IA continua executando em background e atualiza o banco em memória ao finalizar.

## 3. Segurança, Privacidade e Retenção de Dados (PII)

Lidar com holerites envolve dados extremamente sensíveis (Salários, CPFs). As medidas adotadas foram:

- **Ausência de Banco de Dados Físico:** Optei por um banco de dados em memória (\`Map\` do Node.js). O ciclo de vida do dado dura apenas o tempo em que a aplicação está rodando. Se o container for reiniciado, todos os dados são dizimados.
- **Processamento de Arquivos em Buffer:** O \`multer\` foi configurado com \`memoryStorage()\`. Os PDFs não são salvos em disco (nem mesmo na pasta \`/tmp\`). Eles vão da requisição HTTP direto para a memória RAM, são enviados em Base64 via HTTPS criptografado para a API do Google e destruídos pelo Garbage Collector do Node na sequência.
- **Logs Limpos:** O sistema de logs (\`console.log\`) registra apenas IDs e status (\`[Controller] Transcrição abc falhou\`). Nenhum conteúdo de extração é printado no terminal.

## 4. O que ficou de fora (Corte de Escopo)

O foco foi garantir o pipeline completo (Upload -> OCR por IA -> Revisão -> Download Excel).
O bônus de "Rastreabilidade Visual" (clicar na tabela e ver o destaque no PDF) foi cortado. Para implementar isso, seria necessário abandonar o JSON estruturado puro do Gemini e criar um pipeline mais complexo mesclando o retorno de posições \`[x,y]\` (Bounding Boxes) nativo do Google Cloud Vision API ou do Azure DocumentAI, o que estouraria as 14 horas propostas.
