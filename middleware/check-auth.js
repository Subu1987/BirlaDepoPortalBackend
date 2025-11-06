const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let data = jwt.verify(token, "this_string_should_be_longer");
    req.user = data;
    next();
  } catch (error) {
    res.json({ code: 100, status: false, message: "Auth failed" });
  }
};
