import Post from "../models/Post.js";

const USER_SELECTABLE_STATUS = ["draft", "pending"];

export const createPost = async(req, res, next) => {
    try {
        const { title, description, content, image, category, status } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "title and content are required" });
        }
        if (status && !USER_SELECTABLE_STATUS.includes(status)) {
            return res.status(400).json({ message: 'status must be "draft" or "pending"' });
        }
        const post = await Post.create({
            title,
            description,
            content,
            image,
            category,
            status: status || "draft",
            createdBy: req.user._id,
        });
        res.status(201).json({ post });
    } catch (err) {
        next(err);
    }
};

export const getApprovedPosts = async(req, res, next) => {
    try {
        const filter = { status: "approved" };
        if (req.query.category) filter.category = req.query.category;
        const posts = await Post.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json({ count: posts.length, posts });
    } catch (err) {
        next(err);
    }
};

export const getApprovedPostById = async(req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, status: "approved" }).populate(
            "createdBy",
            "name email"
        );
        if (!post) return res.status(404).json({ message: "Approved post not found" });
        res.json({ post });
    } catch (err) {
        next(err);
    }
};

export const getMyPosts = async(req, res, next) => {
    try {
        const posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ count: posts.length, posts });
    } catch (err) {
        next(err);
    }
};

export const updatePost = async(req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!post) return res.status(404).json({ message: "Post not found" });

        const { title, description, content, image, category, status } = req.body;
        if (status && !USER_SELECTABLE_STATUS.includes(status)) {
            return res.status(400).json({ message: 'status must be "draft" or "pending"' });
        }

        if (title !== undefined) post.title = title;
        if (description !== undefined) post.description = description;
        if (content !== undefined) post.content = content;
        if (image !== undefined) post.image = image;
        if (category !== undefined) post.category = category;

        if (status) {
            post.status = status;
        } else if (post.status === "approved" || post.status === "rejected") {
            // Edited content must go through approval again
            post.status = "pending";
        }

        await post.save();
        res.json({ post });
    } catch (err) {
        next(err);
    }
};

export const deletePost = async(req, res, next) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post deleted" });
    } catch (err) {
        next(err);
    }
};