import { prisma, Role } from "@cce/prisma";
import { body, validationResult, type ValidationError } from "express-validator";
import { AVAILABLE_ROLES } from "../utils/constants.js";
import { Request, Response, NextFunction } from "express";
import { ErrorType } from "@cce/shared-types";

export const validateInputs = (req:Request, res:Response, next:NextFunction)  => {
  const results = validationResult(req)
  if (!results.isEmpty()) {
    const arr = results.array()
    const errors: ErrorType = {}
    for(const e of arr) {
      if(e.type === "field") {
        errors[e.path] = e.msg
      }
    }
    return res.status(400).json(errors)
  }
  next()
}

export const validateSignIn = [
  body('identifier')
    .trim()
    .notEmpty().withMessage("Email or Username required").bail()
    .isString().withMessage("Invalid input").bail(),
  body('password')
    .notEmpty().withMessage("Password required"),
  validateInputs
]

export const validateSignUp = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email required").bail()
    .isEmail().withMessage("Invalid email").bail()
    .custom( async value => {
      const existingUser = await prisma.user.count({where: { email: value }}) 
      if (existingUser > 0) {
        throw new Error("Email already in use")
      }
    }),
  body('username')
    .trim()
    .notEmpty().withMessage("Username required").bail()
    .isLength({ min: 4 }).withMessage("Username too short").bail()
    .custom(value => {
      if (value.includes('@')) throw new Error("Can not contain '@'")
      return true
    })
    .custom(async value  => {
      const existingUser = await prisma.user.count({where: { username: value }}) 
      if (existingUser > 0) {
        throw new Error("Username already in use")
      }
      return true
    }),
  body('password')
    .trim()
    .notEmpty().withMessage("Password required")
    .isLength({ min: 6 }).withMessage("Minimum 6 characters").bail()
    .matches(/[A-Z]/).withMessage('Uppercase character is needed').bail()
    .matches(/[\W]/).withMessage('Missing a special character').bail(),
  body('confirm')
    .trim()
    .notEmpty().withMessage("Confirm password")
    .custom((value, { req }) => {
      if(req.body.password !== value) {
        throw new Error("Password do not match")
      }
      return true
    }),
  validateInputs
]

export const validateName = [
  body("name")
    .trim()
    .isString().withMessage("Invalid input").bail()
    .notEmpty().withMessage("Name required"),
  validateInputs
]
    

export const validateRoles = [
  body("usersId")
    .isArray().withMessage("Invalid input")
    .custom(value => {
      if(!value.every(Number.isInteger)) {
        throw new Error("Item must contain ids")
      }
      return true
    }),
  body("roles")
    .isArray().withMessage("Invalid input")
    .isIn(AVAILABLE_ROLES).withMessage("Invalid assigned roles"),
  validateInputs
]