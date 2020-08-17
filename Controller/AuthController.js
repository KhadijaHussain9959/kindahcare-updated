exports.getSignup = (req, res, next) => {
  res.render("Auth/signup", {
    PageTitle: "Sign Up",
  });
};

exports.getLogin = (req, res, next) => {
  res.render("Auth/login", {
    PageTitle: "Login",
  });
};

exports.getForgetPassword = (req, res, next) => {
  res.render("Auth/forgetPassword", {
    PageTitle: "Forget Password",
  });
};
