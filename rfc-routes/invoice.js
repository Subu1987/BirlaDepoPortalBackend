const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const poolCreator = require("../middleware/rfc-pool-creator");
// const rfcSettings = require("../connections/rfc-conf");
// let rfc = require("node-rfc");
// const Pool = require("node-rfc").Pool;
// const pool = new rfc.Pool(rfcSettings);

//get delivery id preview
router.post(
  "/get-delivery-details",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let id = req.body.delivery_no;
    console.log(id);
    if (id && Array.isArray(id) && id.length > 0) {
      console.log("got ids");

      const pool = req.pool;

      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_INVOICE_PREVIEW", { IM_VBELN: id })
            .then((data) => {
              console.log(data);
              if (data.EX_INV.length > 0) {
                res.json({
                  status: true,
                  msg: "delivery details fetched.",
                  result: data.EX_INV,
                });
              } else {
                res.json({
                  status: false,
                  msg: "Please provide a valid delivery no array.",
                });
              }
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
    } else {
      res.json({
        status: false,
        msg: "Please provide a valid delivery no.",
      });
    }
  }
);

//create invoice
router.post("/create-invoice", checkAuth, poolCreator, (req, res, next) => {
  let id = req.body.delivery_no;
  console.log(id);
  if (id && Array.isArray(id) && id.length > 0) {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_CREATE_INVOICE", {
            IM_VBELN: id,
            IM_LOGIN_ID: req.body.IM_LOGIN_ID,
          })
          .then((data) => {
            console.log(data);
            res.json({
              status: true,
              msg: "invoice created.",
              result: data.IM_VBELN,
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
  } else {
    res.json({
      status: false,
      msg: "Please provide a valid delivery no array.",
    });
  }
});

//invoice listing api
router.post("/invoice-list", checkAuth, poolCreator, (req, res, next) => {
  let customer_from = req.body.customer_from;
  let customer_to = req.body.customer_to;
  let invoice_date_from = req.body.invoice_date_from;
  let invoice_date_to = req.body.invoice_date_to;
  let invoice_from = req.body.invoice_from;
  let invoice_to = req.body.invoice_to;
  let plant = req.body.plant;

  const pool = req.pool;

  pool
    .acquire()
    .then((client) => {
      console.log("connection opened..");
      let filters = {
        IM_LOGIN_ID: req.body.lv_user,
      };
      if (customer_from && customer_to) {
        filters["CUST_FROM"] = customer_from;
        filters["CUST_TO"] = customer_to;
      }
      if (invoice_date_from && invoice_date_to) {
        filters["DATE_FROM"] = invoice_date_from;
        filters["DATE_TO"] = invoice_date_to;
      }
      if (invoice_from && invoice_to) {
        filters["INV_FROM"] = invoice_from;
        filters["INV_TO"] = invoice_to;
      }
      if (plant) {
        filters["IM_WERKS"] = plant;
      }
      console.log(filters);

      client
        .call("ZRFC_INVOICE_LIST", filters)
        .then((data) => {
          //console.log(data);
          res.json({
            status: true,
            msg: "Invoice list fetched.",
            result: data.IT_FINAL,
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
});

//invoice printing api
router.post("/print-invoice", checkAuth, poolCreator, (req, res, next) => {
  let invoice_number = req.body.invoice_number;

  if (invoice_number) {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");

        client
          .call("ZRFC_INVOICE_PRINT_PDF", {
            IM_INVOICE: invoice_number,
            IM_DS_FLAG: req.body.IM_DS_FLAG,
            IM_LOGIN_ID: req.body.IM_LOGIN_ID,
            I_FLAG: "",
          })
          .then((data) => {
            //console.log(data);
            if (data.EX_BASE64) {
              res.json({
                status: true,
                msg: "Invoice printed sucessfully.",
                data: data.EX_BASE64,
              });
            } else {
              res.json({
                status: false,
                msg: "Error",
                data: data,
              });
            }
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
  } else {
    res.json({
      status: false,
      msg: "Please provide a valid invoice no.",
    });
  }
});

module.exports = router;
