import bcrypt from "bcryptjs";

class Hashing {
  static async hashingData(password) {
    return await bcrypt.hash(password, 10);
  }
  static async compareData(password, hashPass) {
    return await bcrypt.compare(password, hashPass);
  }
}

export default Hashing;
