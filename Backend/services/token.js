import jwt from "jsonwebtoken";

class Tokens {
  static async generatesToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
  }

  static async verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  }
}
export default Tokens;
