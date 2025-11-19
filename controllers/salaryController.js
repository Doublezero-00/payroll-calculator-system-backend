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

    const user = await db.query("SELECT * FROM salaries WHERE id = ?", [id]);
    if(user.length === 0) {
      return res.status(404).json("Can't find user");
    }else {
      db.query("UPDATE salaries SET base_salary = ?, allowance = ?, deductions = ?, overtime_hours = ?, overtime_rate = ?, net_salary = ? WHERE id = ?", [base_salary, allowance, deductions, overtime_hours, overtime_rate, net_salary, id]);
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

export async function getSalaryWithUser(req, res) {
  try {
    const { salaryId } = req.params;

    const [salary] = await db.query("SELECT * FROM salaries WHERE id = ?", [salaryId]);
    if(salary.length === 0) 
      return res.status(404).json("Can't find salary");

    const employeeId = salary[0].employee_id;

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [employeeId]);
    if(user.length === 0)
      return res.status(404).json("Can't find user");

    return res.json({ salary: salary[0], user: user[0] });

  }catch(error) {
    return res.status(500).json({ message: error.message });
  }  
}

export default async function generateSalaryPDF(req, res) {
  try {
    const { salaryId } = req.params;

    const [salary] = await db.query("SELECT * FROM salaries WHERE id = ?", [salaryId]);
    if(salary.length === 0)
      return res.status(404).json("Can't find salary");

    const employeeId = salary[0].employee_id;

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [employeeId]);
    if(user.length === 0)
      return res.status(404).json("Can't find user");

    //Create directory
    const dir = path.join(__dirname, "..", "uploads", "reports");
    if(!fs.existsSync(dir))
      fs.mkdirSync(dir, { recursive: true });

    const fileName = `salary_report_${salaryId}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    //Create pdf
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(22).text("Salary Report", {align: "center"});
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

    //Store file path in db
    await db.query("INSERT INTO salary_reports (employee_id, salary_id, file_path) VALUES (?, ?, ?)", [employeeId, salaryId, `/uploads/reports/${fileName}`]);

    return res.json({
      message: "PDF Generated Successfully",
      file_path: `/uploads/reports/${fileName}`
    });

  }catch(error) {
    return res.status(500).json({ message: error.message });
  }
}
