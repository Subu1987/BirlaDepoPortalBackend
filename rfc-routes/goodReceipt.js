const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const poolCreator = require("../middleware/rfc-pool-creator");
// const rfcSettings = require("../connections/rfc-conf");
// let rfc = require("node-rfc");
// const Pool = require("node-rfc").Pool;
// const pool = new rfc.Pool(rfcSettings);

//search customer
router.post("/search-customer", checkAuth, poolCreator, (req, res, next) => {
  let search_key = req.body.search_key;

  if (search_key) {
    const pool = req.pool;

    search_key = search_key.toLowerCase();
    // pool.acquire().then(client => {
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZFM_RECEIVING_PLANT_GR", {
            VBELN: "123",
            IM_LOGIN_ID: req.body.lv_user,
          })
          .then((data) => {
            let result = data.IT_FINAL.filter(
              (d) =>
                d.KUNNR.toLowerCase().includes(search_key) ||
                d.NAME1.toLowerCase().includes(search_key)
            );
            res.json({
              status: true,
              msg: "Customer fetched.",
              data: result,
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
            // pool.release(client, function(){});
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
      msg: "You must provide a search key.",
    });
  }
});

//fetch good receipt list
router.post(
  "/initial-good-receipt-list",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let customer_number = req.body.customer_number;
    let delivery_date_from = req.body.delivery_date_from;
    let delivery_date_to = req.body.delivery_date_to;
    let delivery_number_from = req.body.delivery_number_from;
    let delivery_number_to = req.body.delivery_number_to;

    if (customer_number && delivery_date_from && delivery_date_to) {
      let query = {
        IM_KUNNR: customer_number,
        DATE_FROM: delivery_date_from,
        DATE_TO: delivery_date_to,
      };
      if (delivery_number_from) {
        query = {
          ...query,
          DELV_FROM: delivery_number_from,
        };
      }
      if (delivery_number_to) {
        query = {
          ...query,
          DELV_TO: delivery_number_to,
        };
      }
      const pool = req.pool;

      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          console.log(query);
          client
            .call("ZRFC_GR_INITIAL_LIST", query)
            .then((data) => {
              res.json({
                status: true,
                msg: "Good receipt fetched.",
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
    } else {
      res.json({
        status: false,
        msg: "You must provide all the required fields.",
      });
    }
  }
);

//calculate balance quantity
router.post(
  "/calculate-balance-quantity",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let delivered_quantity = req.body.delivered_quantity;
    let received_quantity = req.body.received_quantity;

    if (delivered_quantity && received_quantity) {
      const pool = req.pool;

      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_GR_CALC_BALNC_QTY", {
              IM_DELV_QTY: delivered_quantity,
              IM_RECV_QTY: received_quantity,
            })
            .then((data) => {
              res.json({
                status: true,
                msg: "Balanced quantity.",
                data: data.EX_BALNC_QTY,
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
        msg: "You must provide a received_quantity and received_quantity.",
      });
    }
  }
);

//fetch condition type
router.post(
  "/fetch-condition-type",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZFM_COND_TYPE_GR", {
            VBELN: "1234",
          })
          .then((data) => {
            res.json({
              status: true,
              msg: "Condition type fetched.",
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

//fetch storage location
router.post(
  "/fetch-condition-based-storage-location",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let condition_type = req.body.condition_type;
    let plant = req.body.plant;
    if (condition_type && plant) {
      const pool = req.pool;
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_GR_GET_STORAGE_LOC", {
              IM_COND_TYPE: condition_type,
              IM_WERKS: plant,
              IM_VKORG: req.body.IM_VKORG,
              IM_SHIP_TYPE: req.body.IM_SHIP_TYPE,
            })
            .then((data) => {
              res.json({
                status: true,
                msg: "storage location fetched.",
                data: data.IT_STORAGE_LOC,
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
        msg: "please provide all the fields.",
      });
    }
  }
);

router.post(
  "/good-receipt-create",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let IT_GR_CREATE = req.body.IT_GR_CREATE;
    let IT_BATCH_DETAIL = req.body.IT_BATCH_DETAIL;
    let IM_LOGIN_ID = req.body.IM_LOGIN_ID;

    if (IT_GR_CREATE && IT_BATCH_DETAIL) {
      const pool = req.pool;

      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          let query = {
            IT_GR_CREATE,
            IT_BATCH_DETAIL,
            IM_LOGIN_ID,
          };
          console.log(query);
          client
            .call("ZRFC_GR_CREATE", query)
            .then((data) => {
              console.log(data);
              if (data.ET_RETURN.length > 0) {
                res.json({
                  status: true,
                  msg: "Good receipt created.",
                  data: data.ET_RETURN.map((ele) => ele.MESSAGE),
                });
              } else {
                res.json({
                  status: false,
                  test: data,
                  msg:
                    data.ET_RETURN.length > 0
                      ? data.ET_RETURN[0].MESSAGE
                      : "Server error",
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
        msg: "You must provide all the required fields.",
      });
    }
  }
);

//fetch all receiving plant
router.post(
  "/fetch-receiving-plant-gr-listing",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..", req.user.user_code);
        client
          .call("ZRFC_GR_RECEIVING_PLANT", { LOGIN_ID: req.user.user_code })
          .then((data) => {
            res.json({
              status: true,
              msg: "receiving plant fetched fetched.",
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
        console.log(pool);
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

//fetch all ship type
router.post(
  "/fetch-ship-type-gr-listing",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_GR_SHIP_TYPE", { SHIP_TYPE: "" })
          .then((data) => {
            res.json({
              status: true,
              msg: "ship type fetched.",
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

///fetch-good-receipt-list
router.post(
  "/fetch-good-receipt-list",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let gr_date_from = req.body.gr_date_from;
    let gr_date_to = req.body.gr_date_to;
    let receiving_plant = req.body.receiving_plant;
    let ship_type = req.body.ship_type;

    if (gr_date_from && gr_date_to && receiving_plant) {
      let query = {
        GR_DATE_FROM: gr_date_from,
        GR_DATE_TO: gr_date_to,
        RECEIVING_PLANT: receiving_plant,
      };
      if (ship_type) {
        query = {
          ...query,
          SHIP_TYPE: ship_type,
        };
      }
      console.log(query);
      const pool = req.pool;

      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          console.log(query);
          client
            .call("ZRFC_GR_LIST", query)
            .then((data) => {
              //console.log(data)
              res.json({
                status: true,
                msg: "Good receipt fetched.",
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
    } else {
      res.json({
        status: false,
        msg: "You must provide all the required fields.",
      });
    }
  }
);

module.exports = router;
