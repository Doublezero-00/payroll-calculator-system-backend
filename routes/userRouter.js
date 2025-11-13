import express from "express";
import {
  Signup,
  Login,
  getAllUsers,
  EditUser,
  DeleteUser,
} from "../controllers/userController.js";
import {
  signupValidator,
  loginValidator,
  roleValidator,
} from "../validator/auth.js";
import Validate from "../validator/validate.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const userRouter = express.Router();

userRouter.post("/signup", signupValidator, Validate, Signup);
userRouter.post("/login", loginValidator, Validate, Login);
userRouter.get("/all-users", isAuth, isAdmin, getAllUsers);
userRouter.put("/edit/:id", isAuth, isAdmin, roleValidator, Validate, EditUser);
userRouter.delete("/delete/:id", isAuth, isAdmin, DeleteUser);

export default userRouter;
