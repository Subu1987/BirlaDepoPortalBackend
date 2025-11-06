const rfc = require("node-rfc");

module.exports = (req, res, next) => {
  try {
    let rfcSettings = {
      // user: req.user.user_code,
      // passwd: req.user.rfc_password,
      user: "BPCOESD01",
      passwd: "Bcl@1234",
      ashost: "10.235.100.36",
      sysid: "BCQ",
      sysnr: "90",
      client: "700",
      low: 4,
      high: 20,
    };

    console.log("rfcSettings", rfcSettings);
    const pool = new rfc.Pool(rfcSettings);
    req.pool = pool;
    res.set("Connection", "close");
    next();
  } catch (error) {
    console.log(error);
  }
};
