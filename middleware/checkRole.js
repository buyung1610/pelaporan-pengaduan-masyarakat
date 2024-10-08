function checkRole(roles) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      if (roles.includes(req.user.role)) {
        return next();
      } else {
        return res.redirect('/');
      }
    } else {
      res.redirect('/index');
    }
  };
}

module.exports = checkRole;
