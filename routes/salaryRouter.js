import express from "express";
import calculateSalary from "../controllers/salaryController.js";
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

export default salaryRouter;
