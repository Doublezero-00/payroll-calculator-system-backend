import express from "express";
import {calculateSalary, getAllSalaries, updateSalary, deleteSalary} from "../controllers/salaryController.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import calculateSalaryValidator from "../validator/salary.js";
import Validate from "../validator/validate.js";

const salaryRouter = express.Router();

salaryRouter.post(
  "/calculate",
  isAuth,
  isAdmin,
  calculateSalaryValidator,
  Validate,
  calculateSalary
);

salaryRouter.get("/all-salaries", isAuth, isAdmin, getAllSalaries);
salaryRouter.put("/edit/:id", updateSalary);
salaryRouter.delete("/delete/:id", deleteSalary);

export default salaryRouter;
