import db from "../init/mysqlConnection.js";

export default async function calculateSalary(req, res) {
  try {
    const {
      employee_id,
      base_salary,
      allowance,
      deductions,
      overtime_hours,
      overtime_rate
    } = req.body;

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

    res
      .status(201)
      .json({ message: "Salary calculated successfully", net_salary });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
