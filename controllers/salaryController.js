import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import db from "../init/mysqlConnection.js";
import logger from "../logger/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function calculateSalary(req, res) {
  try {
    const {
      employee_id,
      base_salary,
      allowance,
      deductions,
      overtime_hours,
      overtime_rate,
    } = req.body;

    logger.info(
      `SALARY_CALC_ATTEMPT | BY: ${req.user.email} | EMP_ID: ${employee_id}`
    );

    const net_salary =
      Number(base_salary) +
      Number(allowance) +
      Number(overtime_hours) * Number(overtime_rate) -
      Number(deductions);

    await db.query(
      "INSERT INTO salaries (employee_id, base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        employee_id,
        base_salary,
        allowance,
        deductions,
        overtime_hours,
        overtime_rate,
        net_salary,
      ]
    );

    logger.info(
      `SALARY_CALC_SUCCESS | BY: ${req.user.email} | EMP_ID: ${employee_id} | NET_SALARY: ${net_salary}`
    );

    res.status(201).json({
      message: "Salary calculated successfully",
      net_salary,
    });
  } catch (error) {
    logger.error(
      `SALARY_CALC_ERROR | BY: ${req.user.email} | ${error.message}`
    );
    return res.status(500).json({ message: error.message });
  }
}


export async function getAllSalaries(req, res) {
  try {
    logger.info(`GET_ALL_SALARIES | BY: ${req.user.email}`);

    const [salaries] = await db.query(
      "SELECT id, employee_id, base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary FROM salaries"
    );

    if (salaries.length === 0) {
      logger.warn(`GET_ALL_SALARIES_EMPTY | BY: ${req.user.email}`);
      return res.status(401).json("No any salary");
    }

    logger.info(
      `GET_ALL_SALARIES_SUCCESS | BY: ${req.user.email} | COUNT: ${salaries.length}`
    );

    return res.status(201).json({ userSalaries: salaries });
  } catch (error) {
    logger.error(`GET_ALL_SALARIES_ERROR | BY: ${req.user.email} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}

export async function updateSalary(req, res) {
  try {
    const { base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary } = req.body;
    const id = req.params.id;

    logger.info(`UPDATE_SALARY_ATTEMPT | BY: ${req.user.email} | SALARY_ID: ${id}`);

    const [user] = await db.query("SELECT * FROM salaries WHERE id = ?", [id]);

    if (user.length === 0) {
      logger.warn(`UPDATE_SALARY_NOT_FOUND | BY: ${req.user.email} | SALARY_ID: ${id}`);
      return res.status(404).json("Can't find user");
    }

    await db.query(
      "UPDATE salaries SET base_salary = ?, allowance = ?, deductions = ?, overtime_hours = ?, overtime_rate = ?, net_salary = ? WHERE id = ?",
      [base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary, id]
    );

    logger.info(`UPDATE_SALARY_SUCCESS | BY: ${req.user.email} | SALARY_ID: ${id}`);

    return res.status(200).json("Salary updated successfully");
  } catch (error) {
    logger.error(`UPDATE_SALARY_ERROR | BY: ${req.user.email} | SALARY_ID: ${req.params.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteSalary(req, res) {
  try {
    const id = req.params.id;

    logger.info(`DELETE_SALARY_ATTEMPT | BY: ${req.user.email} | SALARY_ID: ${id}`);

    const [user] = await db.query("SELECT * FROM salaries WHERE id = ?", [id]);

    if (user.length === 0) {
      logger.warn(`DELETE_SALARY_NOT_FOUND | SALARY_ID: ${id}`);
      return res.status(401).json("Can't find user");
    }

    await db.query("DELETE FROM salaries WHERE id = ?", [id]);

    logger.info(`DELETE_SALARY_SUCCESS | BY: ${req.user.email} | SALARY_ID: ${id}`);

    return res.status(200).json("Salary deleted successfully");
  } catch (error) {
    logger.error(`DELETE_SALARY_ERROR | BY: ${req.user.email} | SALARY_ID: ${req.params.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function getSalaryWithUser(req, res) {
  try {
    const { salaryId } = req.params;

    logger.info(`GET_SALARY_DETAILS_ATTEMPT | BY: ${req.user.email} | SALARY_ID: ${salaryId}`);

    const [salary] = await db.query("SELECT * FROM salaries WHERE id = ?", [salaryId]);

    if (salary.length === 0) {
      logger.warn(`GET_SALARY_DETAILS_NOT_FOUND | SALARY_ID: ${salaryId}`);
      return res.status(404).json("Can't find salary");
    }

    const employeeId = salary[0].employee_id;

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [employeeId]);

    if (user.length === 0) {
      logger.warn(`GET_SALARY_USER_NOT_FOUND | EMP_ID: ${employeeId}`);
      return res.status(404).json("Can't find user");
    }

    logger.info(
      `GET_SALARY_DETAILS_SUCCESS | BY: ${req.user.email} | SALARY_ID: ${salaryId} | EMP_ID: ${employeeId}`
    );

    return res.json({
      salary: salary[0],
      user: user[0],
    });

  } catch (error) {
    logger.error(`GET_SALARY_DETAILS_ERROR | BY: ${req.user.email} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function generateSalaryPDF(req, res) {
  try {
    const { salaryId } = req.params;

    logger.info(`PDF_GENERATE_ATTEMPT | BY: ${req.user.email} | SALARY_ID: ${salaryId}`);

    const [salary] = await db.query("SELECT * FROM salaries WHERE id = ?", [salaryId]);

    if (salary.length === 0) {
      logger.warn(`PDF_GENERATE_SALARY_NOT_FOUND | SALARY_ID: ${salaryId}`);
      return res.status(404).json("Can't find salary");
    }

    const employeeId = salary[0].employee_id;

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [employeeId]);

    if (user.length === 0) {
      logger.warn(`PDF_GENERATE_USER_NOT_FOUND | EMP_ID: ${employeeId}`);
      return res.status(404).json("Can't find user");
    }

    const dir = path.join(__dirname, "..", "uploads", "reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `salary_report_${salaryId}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(22).text("Salary Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Employee Name: ${user[0].name}`);
    doc.text(`Employee ID: ${employeeId}`);
    doc.text(`Base Salary: ${salary[0].base_salary}`);
    doc.text(`Allowance: ${salary[0].allowance}`);
    doc.text(`Deductions: ${salary[0].deductions}`);
    doc.text(`Overtime Hours: ${salary[0].overtime_hours}`);
    doc.text(`Overtime Rate: ${salary[0].overtime_rate}`);
    doc.text(`Net Salary: ${salary[0].net_salary}`);

    doc.end();

    writeStream.on("finish", async () => {
      await db.query(
        "INSERT INTO salary_reports (employee_id, salary_id, file_path) VALUES (?, ?, ?)",
        [employeeId, salaryId, `/uploads/reports/${fileName}`]
      );

      logger.info(
        `PDF_GENERATE_SUCCESS | BY: ${req.user.email} | SALARY_ID: ${salaryId} | FILE: ${fileName}`
      );

      return res.json({
        message: "PDF Generated Successfully",
        file_path: `/uploads/reports/${fileName}`,
      });
    });

  } catch (error) {
    logger.error(`PDF_GENERATE_ERROR | BY: ${req.user.email} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}


export async function getMySalary(req, res) {
  try {
    const userId = req.user.id;

    logger.info(`GET_MY_SALARY_ATTEMPT | USER_ID: ${userId}`);

    const [salary] = await db.query("SELECT * FROM salaries WHERE employee_id = ?", [userId]);

    if (salary.length === 0) {
      logger.warn(`GET_MY_SALARY_NOT_FOUND | USER_ID: ${userId}`);
      return res.status(404).json("No salary record found");
    }

    const [user] = await db.query("SELECT * FROM register WHERE id = ?", [userId]);

    logger.info(`GET_MY_SALARY_SUCCESS | USER_ID: ${userId}`);

    return res.json({ salary: salary[0], user: user[0] });

  } catch (error) {
    logger.error(`GET_MY_SALARY_ERROR | USER_ID: ${req.user.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}

export async function downloadMySalaryPDF(req, res) {
  try {
    const userId = req.user.id;

    logger.info(`PDF_DOWNLOAD_ATTEMPT | USER_ID: ${userId}`);

    const [salary_report] = await db.query(
      "SELECT * FROM salary_reports WHERE employee_id = ?",
      [userId]
    );

    if (salary_report.length === 0) {
      logger.warn(`PDF_DOWNLOAD_NOT_FOUND | USER_ID: ${userId}`);
      return res.status(404).json("No salary record found");
    }

    const fileName = salary_report[0].file_path;
    const filePath = path.join(__dirname, "..", fileName);

    logger.info(`PDF_DOWNLOAD_SUCCESS | USER_ID: ${userId} | FILE: ${fileName}`);

    return res.download(filePath);

  } catch (error) {
    logger.error(`PDF_DOWNLOAD_ERROR | USER_ID: ${req.user.id} | ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
}
