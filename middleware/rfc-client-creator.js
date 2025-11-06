const rfc = require("node-rfc");

module.exports = (req, res, next) => {
  try {
    let rfcSettings = {
      user: req.user.user_code,
      passwd: req.user.rfc_password,
      ashost: "10.235.100.37",
      sysid: "UCP",
      sysnr: "90",
      client: "700",
      low: 4,
      high: 20,
    };

    const client = new rfc.Client(rfcSettings);
    req.client = client;
    res.set("Connection", "close");
    next();
  } catch (error) {
    console.log(error);
  }
};
