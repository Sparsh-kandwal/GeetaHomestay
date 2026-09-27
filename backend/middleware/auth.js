import jwt from "jsonwebtoken";

/**
 * Strict auth middleware — rejects the request with 401 if no valid
 * JWT is present. Attached to all protected routes by default.
 */
export const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  const secretKey = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
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

// Default alias — all imports of verifyToken enforce strict requireAuth
export const verifyToken = requireAuth;