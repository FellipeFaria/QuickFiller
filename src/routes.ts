import { Router } from "express";
import { upload } from "./config/multer";
import { TranscricaoController } from "./controllers/TranscicaoController";

const router = Router();
const transcricaoController = new TranscricaoController();

router.post(
  '/transcricoes',
  upload.single('arquivo'),
  transcricaoController.upload
);

router.get(
  '/transcricoes/:id',
  transcricaoController.getStatus
);

export default router;