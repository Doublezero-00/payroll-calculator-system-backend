import express from "express";
import getDashboardStats from "../controllers/dashboardController.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", isAuth, isAdmin, getDashboardStats);

export default dashboardRouter;