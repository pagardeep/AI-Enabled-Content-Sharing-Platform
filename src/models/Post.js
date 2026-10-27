import mongoose from "mongoose";

export const POST_STATUSES = ["draft", "pending", "approved", "rejected"];

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  category: { type: String, trim: true, default: "general" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: POST_STATUSES, default: "draft" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
