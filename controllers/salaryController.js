import db from "../init/mysqlConnection.js";

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
    }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllSalaries(req, res) {
  try {
    const [salaries] = await db.query("SELECT id, employee_id, base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary FROM salaries");

    if(salaries.length === 0) {
      return res.status(401).json("No any salary");
    }else {
      return res.status(201).json({ userSalaries: salaries });
    }
  }catch(error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateSalary(req, res) {
  try {
    const { base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary } = req.body;
    const id = req.params.id;

    const [user] = db.query("SELECT * FROM salaries WHERE id = ?", [id]);
    if(user.length === 0) {
      return res.status(401).json("Can't find user");
    }else {
      db.query("UPDATE salaries SET base_salary = ?, allowance = ?, deductions = ?, overtime_hours = ?, overtime_rate = ?, net_salary = ?", [base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary]);
      return res.status(200).json("Salary updated successfully");
    }
  }catch(error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function deleteSalary(req, res) {
  try {
    const id = req.params.id;

    const [user] = await db.query("SELECT * FROM salaries WHERE id = ?", [id]);
    if(user.length === 0) {
      return res.status(401).json("Can't find user");
    }else {
      await db.query("DELETE FROM salaries WHERE id = ?", [id]);
      return res.status(200).json("Salary deleted successfully");
    }
  }catch(error) {
    return res.status(500).json({ message: error.message });
  }
}
