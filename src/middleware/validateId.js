import mongoose from "mongoose";

export const validateId = (param) => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  next();
};
