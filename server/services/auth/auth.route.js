import AuthController from "./auth.controller.js";
import express from "express";
const router = express.Router();
const basePath = "/api/v1/login";

router.post(
  `${basePath}/auth`,
  AuthController.loginUser
)
router.post(
  `${basePath}/sendOpt/Resetpassword`,
  AuthController.sendResetOtp
)
router.post(
  `${basePath}/validate/otp`,
  AuthController.validateOtp
)
router.post(
  `${basePath}/resetPassword`,
  AuthController.resetPassword
)
// console.log("router",router)
export default router
