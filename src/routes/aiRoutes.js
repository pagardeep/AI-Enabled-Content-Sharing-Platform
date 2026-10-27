import { Router } from "express";
import { improvePost } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";
import { validateId } from "../middleware/validateId.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Optional multipart field "file" (PDF/TXT) can be attached as reference for Gemini
router.post("/improve/:postId", protect, validateId("postId"), upload.single("file"), improvePost);

export default router;
