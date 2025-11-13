import { check } from "express-validator";

const calculateSalaryValidator = [
    check("base_salary").notEmpty().withMessage("Base salary is required"),
    check("overtime_rate").notEmpty().withMessage("Overtime rate is required"),
]

export default calculateSalaryValidator;