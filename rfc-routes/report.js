const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const poolCreator = require("../middleware/rfc-pool-creator");
// const rfcSettings = require("../connections/rfc-conf");
// let rfc = require("node-rfc");
// const Pool = require("node-rfc").Pool;
// const pool = new rfc.Pool(rfcSettings);

//fetch-company-code
router.post(
  "/leregister-fetch-company-code",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_LE_COMPCODE", { COMP_CODE: "" })
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "Company code fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch-region
router.post(
  "/leregister-fetch-region",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_LE_REGION", { REGION: "" })
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "Region fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch-distribution-channel
router.post(
  "/leregister-fetch-distribution-channel",
  checkAuth,
  poolCreator,

  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_LE_DIST_CHANNEL", { DIST_CHANNEL: "" })
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "Distribution channel fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch-division
router.post(
  "/leregister-fetch-division",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_LE_DIVISION", { DIVISION: "" })
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "Division fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch le register
router.post(
  "/leregister-fetch-list",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        let company_code = req.body.company_code;
        let created_on_from = req.body.created_on_from;
        let created_on_to = req.body.created_on_to;
        let region = req.body.region;
        let distribution_channel = req.body.distribution_channel;
        let division = req.body.division;
        let plant = req.body.plant;
        let body = {
          IM_BUKRS: company_code,
          DATE_FROM: created_on_from,
          DATE_TO: created_on_to,
          IM_LOGIN_ID: req.body.lv_user,
        };
        if (region) {
          body.REGIO_FROM = region;
        }
        if (distribution_channel) {
          body.VTWEG_FROM = distribution_channel;
        }
        if (division) {
          body.SPART_FROM = division;
        }
        if (plant) {
          body.WERKS_FROM = plant;
        }
        console.log(body);
        client
          .call("ZRFC_ZLE011N_N_NEW", body)
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "Le register fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch-sales office
router.post(
  "/report-fetch-sales-office",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    //console.log("hi")

    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_R015_SALES_OFFICE", { IM_LOGIN_ID: req.body.IM_LOGIN_ID })
          .then((data) => {
            var data_to_send = data.IT_VKBUR;
            res.json({
              status: true,
              msg: "Offices fetched.",
              data: data_to_send,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//sales group
router.post(
  "/report-fetch-sales-group",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_ZSD047N_SALES_GRP", { IM_LOGIN_ID: req.body.IM_LOGIN_ID })
          .then((data) => {
            var data_to_send = data.IT_VKGRP;
            //console.log(data_to_send);
            res.json({
              status: true,
              msg: "Sales group fetched.",
              data: data_to_send,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//sales district
router.post(
  "/report-fetch-sales-district",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_R015_SALES_DIST", { IM_LOGIN_ID: req.body.IM_LOGIN_ID })
          .then((data) => {
            var data_to_send = data.IT_BZIRK;
            //console.log(data_to_send);
            res.json({
              status: true,
              msg: "Sales district fetched.",
              data: data_to_send,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//sales district
router.post(
  "/report-fetch-sales-district",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_R015_SALES_DIST", { IM_LOGIN_ID: req.body.IM_LOGIN_ID })
          .then((data) => {
            var data_to_send = data.IT_BZIRK;
            //console.log(data_to_send);
            res.json({
              status: true,
              msg: "Sales district fetched.",
              data: data_to_send,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//sales customer
router.post(
  "/report-fetch-sales-customer",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_R015_SALES_DIST", {})
          .then((data) => {
            var data_to_send = data.IT_BZIRK;
            //console.log(data_to_send);
            res.json({
              status: true,
              msg: "Sales district fetched.",
              data: data_to_send,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fi daywise report
router.post(
  "/fi-daywise-fetch-list",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        let till_date = req.body.till_date;
        let company_code = req.body.company_code;
        let region = req.body.region;
        let sales_office = req.body.sales_office;
        let sales_group_from = req.body.sales_group_from;
        let sales_group_to = req.body.sales_group_to;
        let sales_district_from = req.body.sales_district_from;

        let sales_district_to = req.body.sales_district_to;
        let customer_from = req.body.customer_from;
        let customer_to = req.body.customer_to;
        let distribution_channel = req.body.distribution_channel;
        let division = req.body.division;
        let period1 = req.body.period1;
        let period2 = req.body.period2;
        let period3 = req.body.period3;
        let period4 = req.body.period4;
        let period5 = req.body.period5;
        let period6 = req.body.period6;
        let period7 = req.body.period7;
        let period8 = req.body.period8;
        let period9 = req.body.period9;
        let period10 = req.body.period10;
        let IM_DRCR_FLAG = req.body.IM_DRCR_FLAG;
        let body = {
          P_TDATE: till_date,
          P_BUKRS: company_code,
          P_REGIO: region,
          SO_VKGRP_LOW: sales_group_from,
          SO_VKGRP_HIGH: sales_group_to,
          PA_PRD1: period1,
          IM_LOGIN_ID: req.body.lv_user,
        };
        if (sales_office) {
          body.P_VKBUR = sales_office;
        }
        if (sales_district_from) {
          body.SO_BZIRK_LOW = sales_district_from;
        }
        if (sales_district_to) {
          body.SO_BZIRK_HIGH = sales_district_to;
        }
        if (customer_from) {
          body.SO_KUNNR_LOW = customer_from;
        }
        if (customer_to) {
          body.SO_KUNNR_HIGH = customer_to;
        }
        if (distribution_channel) {
          body.P_VTWEG = distribution_channel;
        }
        if (division) {
          body.P_SPART = division;
        }
        if (period2) {
          body.PA_PRD2 = period2;
        }
        if (period3) {
          body.PA_PRD3 = period3;
        }
        if (period4) {
          body.PA_PRD4 = period4;
        }
        if (period5) {
          body.PA_PRD5 = period5;
        }
        if (period6) {
          body.PA_PRD6 = period6;
        }
        if (period7) {
          body.PA_PRD7 = period7;
        }
        if (period8) {
          body.PA_PRD8 = period8;
        }
        if (period9) {
          body.PA_PRD9 = period9;
        }
        if (period10) {
          body.PA_PRD10 = period10;
        }
        if (IM_DRCR_FLAG) {
          body.IM_DRCR_FLAG = IM_DRCR_FLAG;
        }
        console.log(body);
        client
          .call("ZRFC_R015_DAYWISE_AGEING", body)
          .then((data) => {
            //console.log(data);
            res.json({
              status: true,
              msg: "FI daywise report fetched.",
              data: data.IT_FINAL,
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            console.log("closing ...");
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch le register
router.post(
  "/stock-overview-report",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        const { IM_MATNR, IM_WERKS, IM_LGORT_FROM, IM_LGORT_TO } = req.body;
        if (true) {
          let body = {
            IM_LOGIN_ID: req.body.lv_user,
          };
          if (IM_MATNR) {
            body.IM_MATNR = IM_MATNR;
          }
          if (IM_WERKS) {
            body.IM_WERKS = IM_WERKS;
          }
          if (IM_LGORT_FROM) {
            body.IM_LGORT_FROM = IM_LGORT_FROM;
          }
          if (IM_LGORT_TO) {
            body.IM_LGORT_TO = IM_LGORT_TO;
          }
          console.log(body);
          client
            .call("ZRFC_STOCK_OVERVIEW_REPORT", body)
            .then((data) => {
              console.log(data);
              res.json({
                status: true,
                msg: "stock report fetched.",
                data: data.IT_STOCK,
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: false,
                msg: "server error.",
              });
            })
            .finally(() => {
              console.log("closing ...");
              pool.release(client, function () {});
            });
        } else {
          res.json({
            status: false,
            msg: "please provide necessary details",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

// fetch DR CR report
router.post(
  "/debit-credit-report-report",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        const {
          IM_BUKRS,
          IM_REGIO,
          SO_DATE_LOW,
          SO_DATE_HIGH,
          SO_FKDAT_LOW,
          SO_FKDAT_HIGH,
          IM_PLANT,
          IM_AUART,
        } = req.body;
        if (IM_BUKRS && IM_REGIO) {
          let body = {
            // IM_LOGIN_ID : req.body.lv_user
          };
          if (IM_BUKRS) {
            body.IM_BUKRS = IM_BUKRS;
          }
          if (IM_REGIO) {
            body.IM_REGIO = IM_REGIO;
          }
          if (SO_DATE_LOW) {
            body.SO_DATE_LOW = SO_DATE_LOW;
          }
          if (SO_DATE_HIGH) {
            body.SO_DATE_HIGH = SO_DATE_HIGH;
          }
          if (SO_FKDAT_LOW) {
            body.SO_FKDAT_LOW = SO_FKDAT_LOW;
          }
          if (SO_FKDAT_HIGH) {
            body.SO_FKDAT_HIGH = SO_FKDAT_HIGH;
          }
          if (IM_PLANT) {
            body.IM_PLANT = IM_PLANT;
          }
          if (IM_AUART) {
            body.IM_AUART = IM_AUART;
          }
          console.log(body);
          client
            .call("ZRFC_ZSD047N_DRCR_NOTELIST", body)
            .then((data) => {
              console.log(data);
              res.json({
                status: true,
                msg: "stock report fetched.",
                data: data.IT_FINAL,
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: false,
                msg: "server error.",
              });
            })
            .finally(() => {
              console.log("closing ...");
              pool.release(client, function () {});
            });
        } else {
          res.json({
            status: false,
            msg: "please provide necessary details",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

module.exports = router;
