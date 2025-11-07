import express from "express";
import { Signup, Login, getAllUsers } from "../controllers/userController.js";
import { signupValidator, loginValidator } from "../validator/auth.js";
import Validate from "../validator/validate.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const userRouter = express.Router();

userRouter.post("/signup", signupValidator, Validate, Signup);
userRouter.post("/login", loginValidator, Validate, Login);
userRouter.get("/all-users", isAuth, isAdmin, getAllUsers);

export default userRouter;
