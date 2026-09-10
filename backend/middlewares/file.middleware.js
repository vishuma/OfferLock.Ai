import multer from "multer"

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, callback) => {
        if (file.mimetype === "application/pdf") {
            return callback(null, true);
        }

        return callback(new Error("Only PDF resumes are supported."));
    },
    limits: {
        fileSize: 3 * 1024 * 1024
    }
})