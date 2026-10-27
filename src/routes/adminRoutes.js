import { Router } from "express";
import { getPendingPosts, approvePost, rejectPost } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { validateId } from "../middleware/validateId.js";

const router = Router();
router.use(protect, adminOnly);

router.get("/posts/pending", getPendingPosts);
router.patch("/posts/approve/:id", validateId("id"), approvePost);
router.patch("/posts/reject/:id", validateId("id"), rejectPost);

export default router;
