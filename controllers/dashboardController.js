import db from "../init/mysqlConnection.js";
import logger from "../logger/logger.js"; 


export default async function getDashboardStats(req, res) {
  try {
    logger.info(`DASHBOARD_STATS_REQUEST | BY: ${req.user.email}`);

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

    logger.info(
      `DASHBOARD_STATS_SUCCESS | BY: ${req.user.email} | USERS: ${totalUsers} | EMPLOYEES: ${totalEmployees} | SALARIES: ${totalSalaries}`
    );

    return res.status(200).json({
      totalUsers,
      totalEmployees,
      totalSalaries,
    });

  } catch (error) {
    logger.error(
      `DASHBOARD_STATS_ERROR | BY: ${req.user.email} | ${error.message}`
    );
    return res.status(500).json({ message: error.message });
  }
}
