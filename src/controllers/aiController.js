import Post from "../models/Post.js";
import { improveContent } from "../services/gemini.js";

export const improvePost = async (req, res, next) => {
  try {
    const original = await Post.findOne({ _id: req.params.postId, createdBy: req.user._id });
    if (!original) return res.status(404).json({ message: "Post not found" });

    let improved;
    try {
      improved = await improveContent(original, req.file);
    } catch (err) {
      if (err.status) throw err;
      return res.status(502).json({ message: "AI service error", detail: err.message });
    }

    // Save as a NEW draft; the original stays untouched
    const newPost = await Post.create({
      title: original.title,
      description: original.description,
      content: improved,
      image: original.image,
      category: original.category,
      createdBy: req.user._id,
      status: "draft",
    });

    res.status(201).json({
      message: "Content improved and saved as a new draft",
      originalPostId: original._id,
      post: newPost,
    });
  } catch (err) {
    next(err);
  }
};
