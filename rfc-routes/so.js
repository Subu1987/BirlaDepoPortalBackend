const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
// const rfcSettings = require("../connections/rfc-conf");
// let rfc = require("node-rfc");
const mySqlConnection = require("../connections/connection");
const mysqlConnectionDMS = require("../connections/connectiondms");
const poolCreator = require("../middleware/rfc-pool-creator");

// const pool = new rfc.Pool(rfcSettings);

//fetch so details
router.post(
  "/fetch-so-details/:id",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let id = req.params.id;
    console.log(id);

    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_SO_CHANGE_INITIAL", { IM_VBELN: id })
          .then((data) => {
            console.log(data);
            if (data.IT_ORDER.length > 0) {
              res.json({
                status: true,
                msg: "so details fetched.",
                data: data.IT_ORDER[0],
              });
            } else {
              res.json({
                status: false,
                msg: "Invalid id",
              });
            }
          })
          .catch((err) => {
            console.log("so", err);
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

//fetch so details
router.post(
  "/fetch-all-reason-of-rejections",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_REASON_FOR_REJ", {})
          .then((data) => {
            console.log(data);
            res.json({
              status: true,
              msg: "Reason of rejection sent.",
              data: data.EX_BEZEI,
            });
          })
          .catch((err) => {
            console.log("so", err);
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

//fetch so details
router.post("/update-so-details", checkAuth, poolCreator, (req, res, next) => {
  let IM_SALES_ORDER = req.body.IM_SALES_ORDER;
  let IM_SHIPTOPARTY = req.body.IM_SHIPTOPARTY;
  let IM_PODATE = req.body.IM_PODATE;
  let IM_MATERIAL = req.body.IM_MATERIAL;
  let IM_SUPPLYING_PLANT = req.body.IM_SUPPLYING_PLANT;
  let IM_PO = req.body.IM_PO;
  let IM_SHIPPING_POINT = req.body.IM_SHIPPING_POINT;
  let IM_SHIPPING_TYPE = req.body.IM_SHIPPING_TYPE;
  let IM_REQ_QTY = req.body.IM_REQ_QTY;
  let IM_REJ_REASON = req.body.IM_REJ_REASON;
  let IM_REMARKS = req.body.IM_REMARKS;
  let IM_INCO = req.body.IM_INCO;
  let IM_INCO_DESC = req.body.IM_INCO_DESC;
  let IM_LOGIN_ID = req.body.IM_LOGIN_ID;
  let IM_L2_REASON = req.body.IM_L2_REASON;
  console.log(
    IM_INCO_DESC,
    IM_INCO,
    IM_REQ_QTY,
    IM_SHIPPING_TYPE,
    IM_SHIPPING_POINT,
    IM_SALES_ORDER,
    IM_SHIPTOPARTY,
    IM_MATERIAL,
    IM_SUPPLYING_PLANT
  );

  let body = {
    IM_SALES_ORDER,
    IM_SHIPTOPARTY,
    IM_MATERIAL,
    IM_SUPPLYING_PLANT,
    IM_SHIPPING_POINT,
    IM_SHIPPING_TYPE,
    IM_REQ_QTY,
    IM_INCO,
    IM_INCO_DESC,
    IM_L2_REASON,
    IM_LOGIN_ID,
  };
  if (IM_REMARKS) {
    body["IM_REMARKS"] = IM_REMARKS;
  }
  if (IM_REJ_REASON) {
    body["IM_REJ_REASON"] = IM_REJ_REASON;
  }
  if (IM_PODATE) {
    body["IM_PODATE"] = IM_PODATE;
  }
  if (IM_PO) {
    body["IM_PO"] = IM_PO;
  }
  console.log(body);
  const pool = req.pool;

  pool
    .acquire()
    .then((client) => {
      console.log("connection opened..");
      client
        .call("ZSALES_ORDER_CHANGE", body)
        .then((data) => {
          console.log(data);
          if (data.IT_RETURN.length > 0) {
            if (data.IT_RETURN[0].TYPE === "S") {
              res.json({
                status: true,
                msg: "SO updated.",
                data: data.IT_RETURN,
              });
            } else {
              let errmsg = data.IT_RETURN.filter(
                (e) => e.TYPE == "E" || e.TYPE == "I"
              );
              var mgs = "";
              errmsg.forEach((ele) => {
                mgs = mgs + ele.MESSAGE;
              });
              res.json({
                status: false,
                msg: mgs,
              });
            }
          } else {
            res.json({
              status: false,
              msg: "server error.",
            });
          }
        })
        .catch((err) => {
          console.log("so", err);
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

//fetch so details
router.post(
  "/update_so_requests_with_login_id",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        mysqlConnectionDMS.query(
          "select * from so_requests where permitted_depot_user is null ",
          [],
          (err2, row2, fields) => {
            if (!err2) {
              row2.forEach((r) => {
                let sold_to_party = r["sold_to_party"];
                let id = r["id"];
                client
                  .call("ZDMS_FETCH_USERID_FROM_KUNNR", {
                    IM_KUNNR: sold_to_party,
                  })
                  .then((data) => {
                    // let data = {"IM_KUNNR":"0001002855",IT_USER:[{LOGIN_ID:"BPCH0301"},{LOGIN_ID:"BPC21501"},{LOGIN_ID:"BPC21701"},{"LOGIN_ID":"BPC21601"},{"LOGIN_ID":"BCLMG001"},{"LOGIN_ID":"BPC24401"},{"LOGIN_ID":"BPCOESD01"},{"LOGIN_ID":"BPC29401"},{"LOGIN_ID":"BPC21801"},{"LOGIN_ID":"BPC31901"}]};

                    console.log(data);
                    if (data.IT_USER.length > 0) {
                      let permitted_depot_users = "";
                      data.IT_USER.forEach((u) => {
                        permitted_depot_users += u.LOGIN_ID + ",";
                      });
                      permitted_depot_users = permitted_depot_users.substring(
                        0,
                        permitted_depot_users.length - 1
                      );
                      // console.log('In permitted', permitted_depot_users);
                      mysqlConnectionDMS.query(
                        "update so_requests set permitted_depot_user=? where id = ?",
                        [permitted_depot_users, id],
                        (err, row, fields1) => {}
                      );
                    } else {
                    }
                  })
                  .finally(() => {
                    // pool.release(client, function(){});
                  });
              });
            } else {
              console.log(err2);
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          msg: "server error.",
        });
     });
    res.json({
      status: true,
      msg: "Success",
    });
  }
);

module.exports = router;
