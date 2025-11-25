import hashPassword from "../utils/hashPassword.js";
import ComparePassword from "../utils/comparePassword.js";
import GenerateToken from "../utils/generateToken.js";
import db from "../init/mysqlConnection.js";

export async function Signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    const [existingUser] = await db.query(
      "SELECT * FROM register WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await db.query(
      "INSERT INTO register (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, 2]
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("Signup Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function Login(req, res) {
  try {
    const { email, password } = req.body;

    const [user] = await db.query("SELECT * FROM register WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const storedUser = user[0];

    const match = await ComparePassword(password, storedUser.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = GenerateToken(storedUser);

    return res.status(200).json({
      message: "User logged in successfully",
      user: storedUser,
      token,
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const [users] = await db.query("SELECT * FROM register");

    if (users.length === 0) {
      return res.json({ message: "No any user" });
    } else {
      return res.status(200).json({ usersData: users });
    }
  } catch (error) {
    return res.json({ message: error.message });
  }
}

export async function EditUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [id]);

    if (user.length === 0) {
      console.log("User not found");
      return res.status(401).json({ message: "User not found" });
    } else {
      await db.query(
        "UPDATE register SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, id]
      );
      return res.status(200).json({ message: "User updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function DeleteUser(req, res) {
  try {
    const { id } = req.params;

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(401).json({ message: "User not found" });
    } else {
      await db.query("DELETE FROM register WHERE id = ?", [id]);
      await db.query("UPDATE register SET id = id - 1 WHERE id > ?", [id]);
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function GetProfile(req, res) {
  try {
    const email = req.user.email;

    const [user] = await db.query("SELECT * FROM register WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(401).json("Can't find user");
    } else {
      return res.status(200).json(user[0]);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
