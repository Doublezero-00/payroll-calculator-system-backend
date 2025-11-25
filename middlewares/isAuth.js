import jwt from "jsonwebtoken";

const secret_key = process.env.JWT_SECRET;

export default function isAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization
      ? req.headers.authorization.split(" ")
      : [];

    const token = authorization.length > 1 ? authorization[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const payload = jwt.verify(token, secret_key);

    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
