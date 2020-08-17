const express = require("express");
const router = express.Router();
const AuthController = require("../Controller/AuthController.js");
const isAuth = require("../middleware/is-Auth.js");

router.get("/signup", AuthController.getSignup);

router.get("/login", isAuth.isLoginExist, AuthController.getLogin);

router.get("/forgetPassword", AuthController.getForgetPassword);

module.exports = router;
