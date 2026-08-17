import { Router } from "express";
import { upload } from "./config/multer";
import { TranscricaoController } from "./controllers/TranscicaoController";
import { GeminiService } from "./services/GeminiService";
import { ExcelService } from "./services/ExcelService";

const router = Router();
const geminiService = new GeminiService();
const excelService = new ExcelService();
const transcricaoController = new TranscricaoController(geminiService, excelService);

router.post(
  '/transcricoes',
  upload.single('arquivo'),
  transcricaoController.upload
);

router.put(
  '/transcricoes/:id',
  transcricaoController.update
);

router.get(
  '/transcricoes/:id/download',
  transcricaoController.download
);

router.get(
  '/transcricoes/:id',
  transcricaoController.getStatus
);

export default router;