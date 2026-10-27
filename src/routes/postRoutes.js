import { Router } from "express";
import {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import { validateId } from "../middleware/validateId.js";

const router = Router();

router.post("/", protect, createPost);
router.get("/", getApprovedPosts);
// NOTE: /my-posts must be declared before /:id
router.get("/my-posts", protect, getMyPosts);
router.get("/:id", validateId("id"), getApprovedPostById);
router.patch("/:id", protect, validateId("id"), updatePost);
router.delete("/:id", protect, validateId("id"), deletePost);

export default router;
