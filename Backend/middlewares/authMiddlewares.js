import Token from "../services/token.js";

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = Token.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
export default authenticate;
