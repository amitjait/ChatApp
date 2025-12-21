import jwt from "jsonwebtoken";

export const JWT_SECRET = "SUPER_SECRET_KEY";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ msg: "Invalid token" });
  }
};
