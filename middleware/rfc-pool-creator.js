const rfc = require("node-rfc");

module.exports = (req, res, next) => {
  try {
    let rfcSettings = {
      // user: req.user.user_code,
      // passwd: req.user.rfc_password,
      user: "dpportal",
      passwd: "Bcl@1234",
      mshost: "sapprdci",
      sysid: "BCP",
      group: "PARIVARDHAN",
      client: "700",
    };

    //    console.log("rfcSettings", rfcSettings);
    const pool = new rfc.Pool(rfcSettings);
    req.pool = pool;
    res.set("Connection", "close");
    next();
  } catch (error) {
    console.log(error);
  }
};
