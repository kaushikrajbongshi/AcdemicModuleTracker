import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const saltRounds = 10;
const SECRET = process.env.JWT_SECRET;

//CONVERT PLAIN TEXT TO HASH PASSORD
export const convert_hash = async (myPlaintextPassword) => {
  const hash = await bcrypt.hash(myPlaintextPassword, saltRounds);
  return hash;
};

//COMPARE PASSWORD
export const compare_password = async (myPlaintextPassword, hash) => {
  const result = await bcrypt.compare(myPlaintextPassword, hash);
  return result;
};

//GENERATE JWT TOKEN
export const generate_jsonwebtoken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
};

//verify and decode jwt
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};
