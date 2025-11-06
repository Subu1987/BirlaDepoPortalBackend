const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const clientCreator = require("../middleware/rfc-client-creator");
const poolCreator = require("../middleware/rfc-pool-creator");
// const rfcSettings = require("../connections/rfc-conf");
// let rfc = require("node-rfc");
// const Pool = require("node-rfc").Pool;
// const pool = new rfc.Pool(rfcSettings);

//get order details
router.post("/get-order-details", checkAuth, poolCreator, (req, res, next) => {
  let id = req.body.order_id;

  const pool = req.pool;

  //console.log(id);
  if (id) {
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_SALESORDER_DETAILS", { IM_SALES_ORDER: id })
          .then((data) => {
            //console.log(data.IT_FINAL);
            if (data.IT_FINAL.length > 0) {
              res.json({
                status: true,
                msg: "order details fetched.",
                result: data.IT_FINAL[0],
              });
            } else {
              res.json({
                status: false,
                msg: "Please provide a valid order id.",
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
            pool.release(client, function () { });
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
      msg: "Please provide a valid order id.",
    });
  }
});

//get storage location
router.post(
  "/get-storage-location",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let plant = req.body.plant;

    const pool = req.pool;

    //console.log(plant);
    if (plant) {
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZFM_SLOC_DO_CREATE", { LV_PLANT: plant })
            .then((data) => {
              //console.log(data.IT_FINAL);
              res.json({
                status: true,
                msg: "storage locations fetched.",
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
              pool.release(client, function () { });
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
        msg: "Please provide a valid plant id.",
      });
    }
  }
);

//get loading points
router.post("/get-loading-points", checkAuth, poolCreator, (req, res, next) => {
  let shipping_point = req.body.shipping_point;

  const pool = req.pool;
  //console.log(shipping_point);
  if (shipping_point) {
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZFM_LOADING_POINT", { LV_SHIP_POINT: shipping_point })
          .then((data) => {
            //console.log(data.IT_FINAL);
            res.json({
              status: true,
              msg: "loading points fetched.",
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
            pool.release(client, function () { });
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
      msg: "Please provide a valid shipping point.",
    });
  }
});

//get storage location
router.post(
  "/get-storage-location",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let plant = req.body.plant;
    //console.log(plant);
    const pool = req.pool;

    if (plant) {
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZFM_SLOC_DO_CREATE", { LV_PLANT: plant })
            .then((data) => {
              //console.log(data.IT_FINAL);
              res.json({
                status: true,
                msg: "storage locations fetched.",
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
              pool.release(client, function () { });
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
        msg: "Please provide a valid plant id.",
      });
    }
  }
);

//get available stock
router.post(
  "/get-available-stock",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let supplying_plant = req.body.supplying_plant;
    let storage_location = req.body.storage_location;
    let material = req.body.material;
    console.log(supplying_plant, storage_location, material);

    const pool = req.pool;

    if (supplying_plant && storage_location && material) {
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_MATERIAL_STOCK", {
              IM_PLANT: supplying_plant,
              IM_STOREAGE_LOC: storage_location,
              IM_MATERIAL: material,
            })
            .then((data) => {
              //console.log(data.EX_QUANTITY);
              res.json({
                status: true,
                msg: "Available stock fetched.",
                result: data.EX_QUANTITY,
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
              pool.release(client, function () { });
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
        msg: "Please provide all valid inputs.",
      });
    }
  }
);

//get transporter
router.post("/get-transporter", checkAuth, poolCreator, (req, res, next) => {
  let sold_to_party = req.body.sold_to_party || "12345";
  let search_key = req.body.search_key || undefined;
  //let ship_to_party = req.body.ship_to_party;

  console.log(sold_to_party);

  const pool = req.pool;

  pool
    .acquire()
    .then((client) => {
      console.log("connection opened..");
      client
        .call("ZRFC_TRASPORTER_LIST", {
          LV_SOLDPARTY: sold_to_party,
          //LV_SHIPPARTY:ship_to_party
        })
        .then((data) => {
          let result = data.IT_FINAL;
          if (search_key) {
            result = data.IT_FINAL.filter((ele) => {
              if (
                ele["LIFNR"].toLowerCase().includes(search_key) ||
                ele["NAME1"].toLowerCase().includes(search_key)
              ) {
                return ele;
              }
            });
          }
          if (result.length > 100) {
            result = result.slice(0, 100);
          }
          res.json({
            status: true,
            msg: "Transporter fetched.",
            result: result,
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
          pool.release(client, function () { });
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

//get shipping type
router.post(
  "/get-delivery-specific-shipping-type",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    let supplying_plant = req.body.supplying_plant;
    let material = req.body.material;
    console.log(supplying_plant, material);

    const pool = req.pool;

    if (supplying_plant && material) {
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_SHIPPING_POINT_DESC", {
              IM_WERKS: supplying_plant,
              IM_MATNR: material,
            })
            .then((data) => {
              //console.log(data);
              res.json({
                status: true,
                msg: "Shipping type fetched.",
                result: data.EX_SHIP_DESC,
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
              pool.release(client, function () { });
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
        msg: "Please provide all valid inputs.",
      });
    }
  }
);

// get valuation types
router.post(
  "/get-valuation-types",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const { material, plant } = req.body;
    console.log("Fetching valuation types for:", material, plant);

    const pool = req.pool;

    if (material && plant) {
      pool
        .acquire()
        .then((client) => {
          console.log("connection opened..");
          client
            .call("ZRFC_VALUATION_TYPE", {
              IM_MATNR: material,
              IM_WERKS: plant,
            })
            .then((data) => {
              console.log("RFC Data received:", data);

              // Assuming valuation types are returned as an array in data.IT_VALUATION
              res.json({
                status: true,
                msg: "Valuation types fetched successfully.",
                result: data.IT_VALUATION || [],
              });
            })
            .catch((err) => {
              console.error("RFC Error:", err);
              res.json({
                status: false,
                msg: "RFC call failed.",
              });
            })
            .finally(() => {
              console.log("closing ...");
              pool.release(client, function () { });
            });
        })
        .catch((err) => {
          console.error("Pool Error:", err);
          res.json({
            status: false,
            msg: "Server error.",
          });
        });
    } else {
      res.json({
        status: false,
        msg: "Please provide valid 'material' and 'plant' in body.",
      });
    }
  }
);

//create delivery
router.post("/create-delivery", checkAuth, poolCreator, (req, res, next) => {
  console.log(req.body);
  let vehicle = req.body.vehicle;
  let challan_date = req.body.challan_date;
  let remark = req.body.remark;
  let order_id = req.body.order_id;
  let storage_location = req.body.storage_location;
  let route = req.body.route;
  let issue_quantity = req.body.issue_quantity;
  let loading_point = req.body.loading_point;
  let shipping_type = req.body.shipping_type;
  let login_id = req.body.IM_LOGIN_ID;
  let lr = req.body.lr;
  let transporter = req.body.transporter;
  let vkorg = "";
  if (req.body.IM_VKORG) {
    vkorg = req.body.IM_VKORG;
  }

  const pool = req.pool;

  if (
    transporter &&
    vehicle &&
    challan_date &&
    order_id &&
    storage_location &&
    route &&
    issue_quantity &&
    shipping_type
  ) {
    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        let d = {
          IM_VEHICLE: vehicle,
          IM_CHALLAN_DATE: challan_date,
          LINES: [
            {
              TDFORMAT: "*",
              TDLINE: remark,
            },
          ],
          IM_SALES_ORDER: order_id,
          IM_STOREAGE_LOC: storage_location,
          IM_ROUTE: route,
          IM_DELIVERY_QTY: issue_quantity,
          IM_LOADING_POINT: loading_point,
          IM_SHIPPING_TYPE: shipping_type,
          IM_LR: lr,
          IM_TRANSPORTER: transporter,
          IM_LOGIN_ID: login_id,
          IM_SHIPMENT_CONFIRM: req.body.IM_SHIPMENT_CONFIRM,
          IM_VKORG: vkorg,
          IM_BWTAR: req.body.IM_BWTAR,
          IM_GUID: req.body.IM_GUID,
        };
        console.log(d);
        client
          .call("ZRFC_DELIVERY_CREATE", d)
          .then((data) => {
            console.log(data);
            if (data.EX_DELIVERY_NO && data.EX_DELIVERY_NO != "") {
              res.json({
                status: true,
                msg: "Delivery created.",
                result: data.EX_DELIVERY_NO,
              });
            } else {
              let e = data.IT_RETURN.filter(
                (e) => e.TYPE == "E" || e.TYPE == "I"
              );
              res.json({
                status: false,
                msg: e,
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
            pool.release(client, function () { });
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
      msg: "Please provide all valid inputs.",
    });
  }
});

//delivery listing api
router.post("/delivery-list", checkAuth, poolCreator, (req, res, next) => {
  let delivery_from = req.body.delivery_from;
  let delivery_to = req.body.delivery_to;
  let delivery_date_from = req.body.delivery_date_from;
  let delivery_date_to = req.body.delivery_date_to;
  let plant = req.body.plant;
  let pgi = req.body.pgi;
  //   const client = new rfc.Client(rfcSettings);

  const pool = req.pool;

  pool
    .acquire()
    .then((client) => {
      console.log("connection opened..");
      let filters = {
        LV_LOGIN_ID: req.body.lv_user,
      };
      if (delivery_from && delivery_to) {
        filters["DELIVERY_FROM"] = delivery_from;
        filters["DELIVERY_TO"] = delivery_to;
      }
      if (delivery_date_from && delivery_date_to) {
        filters["DATE_FROM"] = delivery_date_from;
        filters["DATE_TO"] = delivery_date_to;
      }
      if (plant) {
        filters["IM_WERKS"] = plant;
      }
      filters["BEFORE_PGI"] = pgi === "before" ? "X" : "";
      console.log(filters);

      client
        .call("ZRFC_DELIVERY_LIST", filters)
        .then((data) => {
          //console.log(data);
          res.json({
            status: true,
            msg: "Delivery list fetched.",
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
          client.close();
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

//create pgi
router.post("/create-pgi", checkAuth, poolCreator, (req, res, next) => {
  var delivery_no = req.body.delivery_no;
  console.log(delivery_no);
  if (delivery_no && Array.isArray(delivery_no) && delivery_no.length > 0) {
    delivery_no.sort();

    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_CREATE_PGI", { IM_VBELN: delivery_no })
          .then((data) => {
            console.log(data);
            if (data) {
              res.json({
                status: true,
                msg: "pgi created.",
                result: data,
              });
            } else {
              res.json({
                status: false,
                msg: "pgi creation failed.",
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
            pool.release(client, function () { });
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
      msg: "Please provide a delivery number.",
    });
  }
});

//get order details
router.get(
  "/get-delivery-details-for-edit/:id",
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
          .call("ZRFC_DELIVARY_CHANGE_DISPLAY", { IM_VBELN: id })
          .then((data) => {
            console.log(data.IT_FINAL);
            if (data.IT_FINAL.length > 0) {
              res.json({
                status: true,
                msg: "delivery details fetched.",
                result: data.IT_FINAL[0],
              });
            } else {
              res.json({
                status: false,
                msg: "Please provide a valid delivery id.",
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
            pool.release(client, function () { });
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

router.post(
  "/delivery-login-matrix-check",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;

    pool
      .acquire()
      .then((client) => {
        console.log("connection opened..");
        client
          .call("ZRFC_DO_CREATE_LOGIN_MTX_CHK", {
            IM_SALES_ORDER: req.body.IM_SALES_ORDER,
            IM_LOGIN_ID: req.body.lv_user,
            IM_WERKS: req.body.IM_WERKS,
          })
          .then((data) => {
            console.log(data);
            if (data.IT_RETURN.length === 0 || data.IT_RETURN[0].TYPE === "S") {
              res.json({
                status: true,
                msg: "you may proceed.",
                data: data.IT_RETURN,
              });
            } else {
              let errmsg = data.IT_RETURN.filter(
                (e) => e.TYPE == "E" || e.TYPE == "I"
              );
              var mgs = "";
              errmsg.forEach((ele) => {
                mgs = mgs + ele.MESSAGE + ". ";
              });
              res.json({
                status: false,
                msg: mgs,
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
            pool.release(client, function () { });
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

//update delivery
router.post("/update-delivery", checkAuth, poolCreator, (req, res, next) => {
  console.log(req.body);
  let IM_VBELN = req.body.IM_VBELN;
  let IM_VEHICLE = req.body.IM_VEHICLE;
  let IM_STROAGE = req.body.IM_STROAGE;
  let IM_ISSUE_QTY = req.body.IM_ISSUE_QTY;
  let IM_LOADING_POINT = req.body.IM_LOADING_POINT;
  let IM_SHIPPING_TYPE = req.body.IM_SHIPPING_TYPE;
  let IM_LR = req.body.IM_LR;
  let IM_TRANSPOTER = req.body.IM_TRANSPOTER;
  let Remarks = req.body.Remarks;
  let IM_LOGIN_ID = req.body.IM_LOGIN_ID;
  let IM_BWTAR = req.body.IM_BWTAR;

  const pool = req.pool;

  pool
    .acquire()
    .then((client) => {
      console.log("connection opened..");
      let d = {
        IM_VBELN,
        IM_VEHICLE,
        IM_STROAGE,
        IM_ISSUE_QTY,
        IM_LOADING_POINT,
        IM_SHIPPING_TYPE,
        IM_LR,
        IM_TRANSPOTER,
        LINES: Remarks,
        IM_LOGIN_ID,
        IM_BWTAR,
      };
      console.log(d);
      client
        .call("ZRFC_DELIVARY_CHANGE_PORTAL", d)
        .then((data) => {
          console.log(data);
          if (data.IT_RETURN.length > 0) {
            if (data.IT_RETURN[0].TYPE === "S") {
              res.json({
                status: true,
                msg: "Delivery updated.",
                data: data.IT_RETURN[0],
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
          console.log(err);
          res.json({
            status: false,
            msg: "server error.",
          });
        })
        .finally(() => {
          console.log("closing ...");
          pool.release(client, function () { });
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

module.exports = router;

