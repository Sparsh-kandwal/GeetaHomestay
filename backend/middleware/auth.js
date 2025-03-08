import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  const secretKey = process.env.JWT_SECRET;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(403).json({ message: "Invalid token" });
    }
  }
};