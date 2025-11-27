import hashPassword from "../utils/hashPassword.js";
import ComparePassword from "../utils/comparePassword.js";
import GenerateToken from "../utils/generateToken.js";
import db from "../init/mysqlConnection.js";
import logger from "../logger/logger.js"; 
   
export async function Signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    logger.info(`SIGNUP_ATTEMPT | EMAIL: ${email}`);

    const [existingUser] = await db.query(
      "SELECT * FROM register WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      logger.warn(`SIGNUP_FAILED_EMAIL_EXISTS | EMAIL: ${email}`);
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await db.query(
      "INSERT INTO register (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, 2]
    );

    logger.info(`SIGNUP_SUCCESS | EMAIL: ${email}`);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    logger.error(`SIGNUP_ERROR | EMAIL: ${req.body.email} | ${error.message}`);
    return res.status(500).json({ message: "Server error" });
  }
}


export async function Login(req, res) {
  try {
    const { email, password } = req.body;

    logger.info(`LOGIN_ATTEMPT | EMAIL: ${email}`);

    const [user] = await db.query("SELECT * FROM register WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      logger.warn(`LOGIN_FAILED_USER_NOT_FOUND | EMAIL: ${email}`);
      return res.status(400).json({ message: "User not found" });
    }

    const storedUser = user[0];
    const match = await ComparePassword(password, storedUser.password);

    if (!match) {
      logger.warn(`LOGIN_FAILED_INVALID_PASSWORD | EMAIL: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = GenerateToken(storedUser);

    logger.info(
      `LOGIN_SUCCESS | EMAIL: ${email} | ROLE: ${storedUser.role}`
    );

    return res.status(200).json({
      message: "User logged in successfully",
      user: storedUser,
      token,
    });
  } catch (error) {
    logger.error(`LOGIN_ERROR | EMAIL: ${req.body.email} | ${error.message}`);
    return res.status(500).json({ message: "Server error" });
  }
}


export async function getAllUsers(req, res) {
  try {
    logger.info(`GET_ALL_USERS | BY: ${req.user.email}`);

    const [users] = await db.query("SELECT * FROM register");

    if (users.length === 0) {
      logger.warn(`GET_ALL_USERS_EMPTY | BY: ${req.user.email}`);
      return res.json({ message: "No any user" });
    }

    logger.info(
      `GET_ALL_USERS_SUCCESS | BY: ${req.user.email} | COUNT: ${users.length}`
    );

    return res.status(200).json({ usersData: users });
  } catch (error) {
    logger.error(`GET_ALL_USERS_ERROR | BY: ${req.user.email} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function EditUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    logger.info(`EDIT_USER_ATTEMPT | BY: ${req.user.email} | USER_ID: ${id}`);

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [id]);

    if (user.length === 0) {
      logger.warn(`EDIT_USER_FAILED_NOT_FOUND | BY: ${req.user.email} | USER_ID: ${id}`);
      return res.status(401).json({ message: "User not found" });
    }

    await db.query(
      "UPDATE register SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );

    logger.info(`EDIT_USER_SUCCESS | BY: ${req.user.email} | USER_ID: ${id}`);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    logger.error(`EDIT_USER_ERROR | BY: ${req.user.email} | USER_ID: ${req.params.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function DeleteUser(req, res) {
  try {
    const { id } = req.params;

    logger.info(`DELETE_USER_ATTEMPT | BY: ${req.user.email} | USER_ID: ${id}`);

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [id]);
    if (user.length === 0) {
      logger.warn(`DELETE_USER_FAILED_NOT_FOUND | BY: ${req.user.email} | USER_ID: ${id}`);
      return res.status(401).json({ message: "User not found" });
    }

    await db.query("DELETE FROM register WHERE id = ?", [id]);
    await db.query("UPDATE register SET id = id - 1 WHERE id > ?", [id]);

    logger.info(`DELETE_USER_SUCCESS | BY: ${req.user.email} | USER_ID: ${id}`);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`DELETE_USER_ERROR | BY: ${req.user.email} | USER_ID: ${req.params.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function GetProfile(req, res) {
  try {
    const email = req.user.email;

    logger.info(`GET_PROFILE_ATTEMPT | EMAIL: ${email}`);

    const [user] = await db.query("SELECT * FROM register WHERE email = ?", [email]);

    if (user.length === 0) {
      logger.warn(`GET_PROFILE_NOT_FOUND | EMAIL: ${email}`);
      return res.status(401).json("Can't find user");
    }

    logger.info(`GET_PROFILE_SUCCESS | EMAIL: ${email}`);

    return res.status(200).json(user[0]);
  } catch (error) {
    logger.error(`GET_PROFILE_ERROR | EMAIL: ${req.user.email} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}
