import { check } from "express-validator";

const signupValidator = [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").notEmpty().withMessage("Email is required"),
    check("password").notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long")
]

const loginValidator = [
    check("email").notEmpty().withMessage("Email is required"),
    check("password").notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long")
]

const roleValidator = [
  check("role").isInt({ min: 1, max: 2 }).withMessage("Role must be either 1 or 2")
];

export { signupValidator, loginValidator, roleValidator };