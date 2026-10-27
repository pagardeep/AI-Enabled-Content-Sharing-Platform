export const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large (max 10 MB)" });
    }
    res.status(err.status || 500).json({ message: err.message || "Server error" });
};