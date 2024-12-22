import AuthController from "./auth.controller.js";
import express from "express";
const router = express.Router();
const basePath = "/api/v1/login";

router.post(
  `${basePath}/auth`,
  AuthController.loginUser
)
// console.log("router",router)
export default router
