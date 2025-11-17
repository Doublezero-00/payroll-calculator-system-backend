import db from "../init/mysqlConnection.js";

export default async function getDashboardStats(req, res) {
  try {
    const [[{ totalUsers }]] = await db.query(
      "SELECT COUNT(*) AS totalUsers FROM register"
    );
    const [[{ totalEmployees }]] = await db.query(
      "SELECT COUNT(*) AS totalEmployees FROM register WHERE role = ?",
      [2]
    );
    const [[{ totalSalaries }]] = await db.query(
      "SELECT COUNT(*) AS totalSalaries FROM salaries"
    );

    return res.status(200).json({
      totalUsers,
      totalEmployees,
      totalSalaries,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
