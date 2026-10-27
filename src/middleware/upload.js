import multer from "multer";

const ALLOWED = ["application/pdf", "text/plain", "text/markdown"];

// Files are kept in memory and sent to Gemini as inline data (see Gemini document processing docs)
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            return cb(Object.assign(new Error("Only PDF, TXT or MD files are allowed"), { status: 400 }));
        }
        cb(null, true);
    },
});