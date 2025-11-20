import express from "express";
import {generateSalaryPDF, calculateSalary, getAllSalaries, updateSalary, deleteSalary, getSalaryWithUser} from "../controllers/salaryController.js";
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
salaryRouter.put("/edit/:id", isAuth, isAdmin, updateSalary);
salaryRouter.delete("/delete/:id", isAuth, isAdmin, deleteSalary);
salaryRouter.get("/preview/:salaryId", isAuth, isAdmin, getSalaryWithUser);
salaryRouter.post("/create-pdf/:salaryId", generateSalaryPDF);

export default salaryRouter;
