function isAuthorization(req, res, next) {
  if (!req.cookies.kindahUserName) {
    return res.redirect("/login");
  }
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
}

function isLoginExist(req, res, next) {
  if (req.cookies.kindahUserName) {
    if (req.cookies.kindahUserType == "Patient")
      return res.redirect("/patientDashboard");
    else return res.redirect("/docDashboard");
  }
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
}

module.exports = {
  isLoginExist: isLoginExist,
  isAuthorization: isAuthorization,
};
