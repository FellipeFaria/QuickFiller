import { Router } from "express";
import { upload } from "./config/multer";
import { TranscricaoController } from "./controllers/TranscicaoController";
import { GeminiService } from "./services/GeminiService";

const router = Router();
const geminiService = new GeminiService();
const transcricaoController = new TranscricaoController(geminiService);

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
  '/transcricoes/:id',
  transcricaoController.getStatus
);

export default router;