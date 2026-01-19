const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const poolCreator = require("../middleware/rfc-pool-creator");
const connection = require("../connections/connection");
var rfc = require("node-rfc");
const { escape, escapeId } = require("mysql");

const ValuationType = require("../models/ValuationType");

// const rfcSettings = require("../connections/rfc-conf");
// const pool = new rfc.Pool(rfcSettings);

// var rfcstring = {
//   'user': 'bclit005',
//   'passwd': 'Teetan@123',
//   'ashost': '52.172.130.94',
//   'sysid': 'BSQ',
//   'sysnr': '90',
//   'client': '700'
// };

const handleClientCall = (pool, functionName, data, response) => {
  pool.acquire().then((client) => {
    client
      .call(functionName, { ...data })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          return resMaker(1, err, "Could not fetch", response);
        }
        pool.release(client, function () {});
        return resMaker(0, res, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
};

router.post(
  "/get_orders_type_dropdown",
  checkAuth,
  poolCreator,
  (req, response) => {
    let data = req.body.vbeln;
    const pool = req.pool;

    if (req.body.vbeln !== undefined || req.body.vbeln !== null) {
      data = req.body.vbeln.toString();
    }

    handleClientCall(post, "ZFM_ORDER_TYPE", { VBELN: data }, response);
  }
);

router.post(
  "/get_orders_type_dropdown_for_delivery",
  checkAuth,
  poolCreator,
  (req, response) => {
    let data = req.body.vbeln;
    const pool = req.pool;
    if (req.body.vbeln !== undefined || req.body.vbeln !== null) {
      data = req.body.vbeln.toString();
    }

    handleClientCall(
      pool,
      "ZFM_ORDER_TYPE_DO_CREATE",
      { VBELN: data },
      response
    );
  }
);

router.post("/get_zfm_plants", checkAuth, poolCreator, (req, response) => {
  const pool = req.pool;
  let data = req.body.lv_user;
  if (req.body.lv_user !== null) {
    data = req.body.lv_user.toString();
  }
  pool.acquire().then((client) => {
    client
      .call("ZFM_PLANT", { LV_USER: data })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          return resMaker(1, err, "Could not fetch", response);
        }
        pool.release(client, function () {});
        return resMaker(0, res, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });

  // UserPlant.findOne({ LV_USER: data })
  //   .then((userPlant) => {
  //     if (userPlant) {
  //       return resMaker(0, userPlant, "Fetched", response);
  //     } else {
  //       return resMaker(1, null, "UserPlant not found!", response);
  //     }
  //   })
  //   .catch((err) =>
  //     res.status(400).json({
  //       status: false,
  //       msg: "Error fetching userPlant",
  //       error: err.message,
  //     })
  //   );
});

router.post(
  "/get_materials_of_plants",
  checkAuth,
  poolCreator,
  (req, response) => {
    let data = req.body.lv_plant;
    const pool = req.pool;

    if (req.body.lv_plant !== undefined || req.body.lv_plant !== null) {
      data = req.body.lv_plant.toString();
    }
    pool.acquire().then((client) => {
      client
        .call("ZFM_MATERIAL", { LV_PLANT: data })
        .then((res, err) => {
          if (err) {
            pool.release(client, function () {});
            return resMaker(1, err, "Could not fetch", response);
          }
          pool.release(client, function () {});
          return resMaker(0, res, "Fetched", response);
        })
        .finally(() => {
          pool.release(client, function () {});
        });
    });

    // PlantMaterial.findOne({ LV_PLANT: data })
    //   .then((plant) => {
    //     if (plant) {
    //       return resMaker(0, plant, "Fetched", response);
    //     } else {
    //       return resMaker(1, null, "Plant not found!", response);
    //     }
    //   })
    //   .catch((err) =>
    //     res.status(400).json({
    //       status: false,
    //       msg: "Error fetching plant",
    //       error: err.message,
    //     })
    //   );
  }
);

router.post("/get_sold_to_party", checkAuth, poolCreator, (req, response) => {
  let dataToFind = "";
  let dataToFindType = "KUNNR";
  if (!req.body.customer_name && req.body.cust_no !== undefined) {
    dataToFindType = "KUNNR";
    dataToFind = req.body.cust_no;
  } else if (req.body.cust_name !== undefined) {
    dataToFind = req.body.cust_name;
    dataToFindType = "NAME1";
  }

  const pool = req.pool;

  pool.acquire().then((client) => {
    client
      .call("ZFM_SOLDTOPARTY", {
        VBELN: "1234567899",
        IM_LOGIN_ID: req.body.login_id,
      })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          return resMaker(1, err, "Could not fetch", response);
        }

        const data2 = res;
        let data = [];

        let hardcoded = {
          KUNNR: "0001002841",
          NAME1: "HEMA ENTERPRISES",
        };

        let dataToSend = [];
        for (let i = 0; i < data2.IT_FINAL.length; i++) {
          if (
            data2.IT_FINAL[i][dataToFindType]
              .toString()
              .toLowerCase()
              .includes(dataToFind.toString().toLowerCase()) == true
          ) {
            data.push(data2.IT_FINAL[i]);
          }
        }
        let length = data.length > 100 ? 100 : data.length;

        for (let i = 0; i < length; i++) {
          if (data[i] !== null) {
            dataToSend.push(data[i]);
          }
        }
        pool.release(client, function () {});

        return resMaker(0, dataToSend, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
});

router.post(
  "/zfm_materials_master",
  checkAuth,
  poolCreator,
  (req, response) => {
    let dataToFind = "";
    let dataToFindType = "MAKTX";
    if (!req.body.material_name && req.body.material_no !== undefined) {
      dataToFindType = "MATNR";
      dataToFind = req.body.material_no;
    } else if (req.body.material_name !== undefined) {
      dataToFind = req.body.material_name;
      dataToFindType = "MAKTX";
    }

    const pool = req.pool;

    pool.acquire().then((client) => {
      client
        .call("ZFM_MATERIALS_MASTER", { VBELN: "1234567899" })
        .then((res, err) => {
          if (err) {
            pool.release(client, function () {});
            return resMaker(1, err, "Could not fetch", response);
          }
          pool.release(client, function () {});

          let data = [];
          let dataToSend = [];
          for (let i = 0; i < res.IT_FINAL.length; i++) {
            if (res.IT_FINAL[i][dataToFindType].includes(dataToFind)) {
              data.push(res.IT_FINAL[i]);
            }
          }
          let length = data.length > 100 ? 100 : data.length;
          for (let i = 0; i < length; i++) {
            if (data[i] !== null) {
              dataToSend.push(data[i]);
            }
          }

          return resMaker(0, dataToSend, "Fetched", response);
        })
        .finally(() => {
          pool.release(client, function () {});
        });
    });
  }
);

router.post("/get_status_list", checkAuth, poolCreator, (req, response) => {
  const pool = req.pool;

  pool.acquire().then((client) => {
    client
      .call("ZRFC_SALESORDER_STATUS", { IM_STATUS: "" })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          return resMaker(1, err, "Could not fetch", response);
        }
        pool.release(client, function () {});
        return resMaker(0, res, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
});

router.post("/get_ship_to_party", checkAuth, poolCreator, (req, response) => {
  let data = req.body.lv_customer;
  const pool = req.pool;
  if (req.body.lv_customer !== undefined || req.body.lv_customer !== null) {
    data = req.body.lv_customer.toString();
  }

  handleClientCall(pool, "ZFM_SHIPTOPARTY", { LV_CUSTOMER: data }, response);
});

router.post("/get_shipping_type", checkAuth, poolCreator, (req, response) => {
  let data = req.body.vbeln;
  const pool = req.pool;
  if (req.body.vbeln !== undefined || req.body.vbeln !== null) {
    data = req.body.vbeln.toString();
  }

  handleClientCall(pool, "ZFM_SHIPPING_TYPE", { VBELN: data }, response);
});

router.post("/get_shipping_point", checkAuth, poolCreator, (req, response) => {
  let data = req.body.lv_plant;

  const pool = req.pool;
  if (req.body.lv_plant !== undefined || req.body.lv_plant !== null) {
    data = req.body.lv_plant.toString();
  }

  handleClientCall(pool, "ZFM_SHIPPING_POINT", { LV_PLANT: data }, response);
});

router.post("/get_quantity_unit", checkAuth, poolCreator, (req, response) => {
  let data = req.body.lv_dimid;
  const pool = req.pool;

  if (req.body.lv_dimid !== undefined || req.body.lv_dimid !== null) {
    data = req.body.lv_dimid.toString();
  }

  handleClientCall(pool, "ZFM_QUANTITY_UNIT", { LV_DIMID: data }, response);
});

router.post("/get_sales_area", checkAuth, poolCreator, (req, response) => {
  let data = req.body.lv_customer;
  const pool = req.pool;
  if (req.body.lv_customer !== undefined || req.body.lv_customer !== null) {
    data = req.body.lv_customer.toString();
  }
  pool.acquire().then((client) => {
    client
      .call("ZFM_SALES_AREA", { LV_CUSTOMER: data })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          return resMaker(1, err, "Could not fetch", response);
        }
        let resultToSend = res;
        for (let i = 0; i < res.IT_FINAL.length; i++) {
          let data = res.IT_FINAL[i];
          data = {
            ...data,
            display_name: data.VKORG + "-" + data.VTWEG + "-" + data.SPART,
          };
          resultToSend.IT_FINAL[i] = data;
        }
        pool.release(client, function () {});
        return resMaker(0, resultToSend, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
});

// router.post("/create_sales_order", checkAuth, (req, response) => {

//   data = req.body;

//   const ORDER_HEADER_IN = {
//     ...data.order_header,
//   };
//   let ORDER_HEADER_INX = { ...data.order_header };
//   Object.keys(data.order_header).forEach((e) => {
//     if (ORDER_HEADER_IN[e] != undefined || ORDER_HEADER_IN[e] != null) {
//       ORDER_HEADER_INX[e] = "X";
//     } else {
//       ORDER_HEADER_INX[e] = undefined;
//     }
//   });
//   const ORDER_ITEMS_IN = data.order_items;

//   let ORDER_ITEMS_INX = [...data.order_items];
//   for (let i = 0; i < ORDER_ITEMS_IN.length; i++) {
//     let value = {};
//     Object.keys(ORDER_ITEMS_IN[i]).forEach((key) => {
//       if (key !== "ITM_NUMBER") {
//         value = { ...value, [key]: "X" };
//       } else {
//         value = { ...value, [key]: ORDER_ITEMS_IN[i][key] };
//       }
//     });
//     ORDER_ITEMS_INX[i] = value;
//   }
//   let ORDER_SCHEDULES_IN = {
//     ...req.body.order_schedule,
//   };
//   let ORDER_SCHEDULES_INX = {
//     ...ORDER_SCHEDULES_IN,
//   };
//   ORDER_SCHEDULES_INX.REQ_QTY = "X";
//   ORDER_SCHEDULES_INX.REQ_DATE = "X";
//   ORDER_SCHEDULES_INX.DATE_TYPE = "X";
//   delete ORDER_HEADER_INX.CREATED_BY;
//   ORDER_SCHEDULES_INX = { ...ORDER_SCHEDULES_INX, UPDATEFLAG: "I" };

//   ORDER_PARTNERS = data.partners;
//   pool.acquire().then((client) => {

//     client
//       .call("ZSALES_ORDER_CREATE", {
//         ORDER_HEADER_IN: ORDER_HEADER_IN,
//         ORDER_HEADER_INX: ORDER_HEADER_INX,
//         ORDER_ITEMS_IN: ORDER_ITEMS_IN,
//         ORDER_ITEMS_INX: ORDER_ITEMS_INX,
//         ORDER_PARTNERS: ORDER_PARTNERS,
//         ORDER_SCHEDULES_IN: [ORDER_SCHEDULES_IN],
//         ORDER_SCHEDULES_INX: [ORDER_SCHEDULES_INX],
//         LINES: [data.lines],
//         IM_L2_REASON: req.body.IM_L2_REASON,
//         IM_GUID: req.body.IM_GUID,
//         IM_LOGIN_ID: req.body.IM_LOGIN_ID,
//         IM_DUP_CONFIRM: req.body.IM_DUP_CONFIRM,
//         IM_DMS_REQID: req.body.IM_DMS_REQID,
//       })
//       .then(function (err2, res) {
//         if (err2) {
//           pool.release(client, function () {});
//           return resMaker(1, err2, "Error 2", response);
//         }
//         pool.release(client, function () {});
//         return resMaker(0, res, "Fetched", response);
//       })
//       .finally(() => {
//
//         pool.release(client, function () {});
//       });
//   });

//
// });

// new sales order create function with dynamic rfc settings
router.post("/create_sales_order", checkAuth, poolCreator, (req, response) => {
  data = req.body;

  const pool = req.pool;

  const ORDER_HEADER_IN = {
    ...data.order_header,
  };
  let ORDER_HEADER_INX = { ...data.order_header };
  Object.keys(data.order_header).forEach((e) => {
    if (ORDER_HEADER_IN[e] != undefined || ORDER_HEADER_IN[e] != null) {
      ORDER_HEADER_INX[e] = "X";
    } else {
      ORDER_HEADER_INX[e] = undefined;
    }
  });
  const ORDER_ITEMS_IN = data.order_items;

  let ORDER_ITEMS_INX = [...data.order_items];
  for (let i = 0; i < ORDER_ITEMS_IN.length; i++) {
    let value = {};
    Object.keys(ORDER_ITEMS_IN[i]).forEach((key) => {
      if (key !== "ITM_NUMBER") {
        value = { ...value, [key]: "X" };
      } else {
        value = { ...value, [key]: ORDER_ITEMS_IN[i][key] };
      }
    });
    ORDER_ITEMS_INX[i] = value;
  }
  let ORDER_SCHEDULES_IN = {
    ...req.body.order_schedule,
  };
  let ORDER_SCHEDULES_INX = {
    ...ORDER_SCHEDULES_IN,
  };
  ORDER_SCHEDULES_INX.REQ_QTY = "X";
  ORDER_SCHEDULES_INX.REQ_DATE = "X";
  ORDER_SCHEDULES_INX.DATE_TYPE = "X";
  delete ORDER_HEADER_INX.CREATED_BY;
  ORDER_SCHEDULES_INX = { ...ORDER_SCHEDULES_INX, UPDATEFLAG: "I" };

  ORDER_PARTNERS = data.partners;
  pool.acquire().then((client) => {
    client
      .call("ZSALES_ORDER_CREATE", {
        ORDER_HEADER_IN: ORDER_HEADER_IN,
        ORDER_HEADER_INX: ORDER_HEADER_INX,
        ORDER_ITEMS_IN: ORDER_ITEMS_IN,
        ORDER_ITEMS_INX: ORDER_ITEMS_INX,
        ORDER_PARTNERS: ORDER_PARTNERS,
        ORDER_SCHEDULES_IN: [ORDER_SCHEDULES_IN],
        ORDER_SCHEDULES_INX: [ORDER_SCHEDULES_INX],
        LINES: [data.lines],
        IM_L2_REASON: req.body.IM_L2_REASON,
        IM_GUID: req.body.IM_GUID,
        IM_LOGIN_ID: req.body.IM_LOGIN_ID,
        IM_DUP_CONFIRM: req.body.IM_DUP_CONFIRM,
        IM_DMS_REQID: req.body.IM_DMS_REQID,
      })
      .then(function (err2, res) {
        if (err2) {
          pool.release(client, function () {});
          return resMaker(1, err2, "Error 2", response);
        }
        pool.release(client, function () {});
        return resMaker(0, res, "Fetched", response);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
});

// end of new sales order create function with dynamic rfc settings

router.post(
  "/get_sales_order_list",
  checkAuth,
  poolCreator,
  (req, response) => {
    // const data =  req.body.lv_customer.toString();

    let mapping = {
      LV_LOGIN_ID: req.body.lv_user,
    };

    if (req.body.CUSTOMER_NUMBER !== undefined) {
      mapping = { ...mapping, IM_KUNNR: req.body.CUSTOMER_NUMBER };
    }
    if (req.body.MATERIAL !== undefined) {
      mapping = { ...mapping, IM_MATNR: req.body.MATERIAL };
    }
    if (req.body.DOCUMENT_DATE !== undefined) {
      mapping = { ...mapping, DATE_FROM: req.body.DOCUMENT_DATE };
    }
    if (req.body.DOCUMENT_DATE_TO !== undefined) {
      mapping = { ...mapping, DATE_TO: req.body.DOCUMENT_DATE_TO };
    }
    if (req.body.PLANT !== undefined) {
      mapping = { ...mapping, IM_WERKS: req.body.PLANT };
    }
    if (req.body.STATUS !== undefined) {
      mapping = { ...mapping, IM_STATUS: req.body.STATUS };
    }
    let receivedData;
    if (Object.entries(req.body).length == 0) {
      return resMaker(
        1,
        [],
        "Please Enter Atleast One Value To Get Results",
        response
      );
    }
    const pool = req.pool;

    handleClientCall(pool, "ZRFC_SALESORDER_LIST", { ...mapping }, response);

    // setTimeout(function () {
    //   if (receivedData == undefined) {
    //     return resMaker(1, [], 'Could not fetch', response);
    //   }
    // }, 15000);
  }
);

// router.post("/incoterms", checkAuth, poolCreator, (req, res) => {
//   const pool = req.pool;
//   pool.acquire().then((client) => {
//     client
//       .call("ZRFC_POPULATE_INCOTERMS", {
//         IM_LOGIN_ID: req.body.lv_user,
//         IM_KUNNR: req.body.IM_KUNNR,
//         IM_WERKS: req.body.IM_WERKS,
//         IM_VKORG: req.body.LV_SALESORG,
//         IM_VTWEG: req.body.LV_DIST,
//         IM_SPART: req.body.LV_DIV,
//       })
//       .then((result) => {
//         if (result.EX_INCOTERM.length > 0) {
//           pool.release(client, function () {});
//           res.json({
//             status: true,
//             msg: "inco term fetched",
//             result: result.EX_INCOTERM,
//             type: "editable",
//           });
//         } else {
//           client
//             .call("ZFM_INCOTERMS", {
//               LV_CUSTOMER: req.body.LV_CUSTOMER,
//               LV_SALESORG: req.body.LV_SALESORG,
//               LV_DIST: req.body.LV_DIST,
//               LV_DIV: req.body.LV_DIV,
//             })
//             .then((result2) => {
//               res.json({
//                 status: true,
//                 msg: "inco term fetched",
//                 result: result2.IT_FINAL,
//                 type: "fixed",
//               });
//             })
//             .catch((err) => {
//               pool.release(client, function () {});
//               res.json({
//                 status: false,
//                 msg: "server error",
//               });
//             });
//         }
//       })
//       .catch((err) => {
//         res.json({
//           status: false,
//           msg: "server error",
//         });
//       });
//   });
// });

// get inco-terms data from sql table
router.post("/incoterms", (req, res) => {
  const { LV_SALESORG } = req.body;

  if (LV_SALESORG) {
    connection.query(
      "SELECT * FROM INCOTERMS WHERE VKORG = ?",
      [LV_SALESORG],
      (err, results) => {
        if (err) {
          console.error(err);
          return resMaker(1, err, "Could not fetch", res);
        }

        // add a new key BEZEI with the value of INCO2
        const updatedData = results.map((result) => {
          return {
            ...result,
            BEZEI: result.INCO2,
          };
        });

        return resMaker(0, updatedData, "Fetched", res);
      }
    );
  } else {
    return resMaker(1, [], "Error", res);
  }
});

// add incoterms data to sql table
router.post("/add_incoterms", (req, res) => {
  const { MANDT, VKORG, INCO1, INCO2 } = req.body;

  connection.query(
    "INSERT INTO INCOTERMS SET ?",
    { MANDT, VKORG, INCO1, INCO2 },
    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not fetch", res);
      } else {
        return resMaker(0, results, "Fetched", res);
      }
    }
  );
});

// get all incoterms data from sql table
router.post("/get_all_incoterms", (req, res) => {
  connection.query("SELECT * FROM INCOTERMS", (err, results) => {
    if (err) {
      return resMaker(1, err, "Could not fetch", res);
    } else {
      return resMaker(0, results, "Fetched", res);
    }
  });
});

// delete incoterms data from sql table by id
router.post("/delete_incoterms_by_id", (req, res) => {
  let id = req.body.id;

  connection.query("DELETE FROM INCOTERMS WHERE id = ?", id, (err, results) => {
    if (err) {
      return resMaker(1, err, "Could not fetch", res);
    } else {
      return resMaker(0, results, "Fetched", res);
    }
  });
});

// END incoterms section

// Valuation Type Start

router.post("/get_valuation_types", checkAuth, async (req, res) => {
  try {
    const list = await ValuationType.find({}).sort({ createdAt: -1 });

    return resMaker(0, list, "Fetched", res);
  } catch (err) {
    console.error(err);
    return resMaker(1, err, "Could not fetch", res);
  }
});

router.post("/add_valuation_type", checkAuth, async (req, res) => {
  try {
    const { DEPT_CODE, VALUATION_TYPE } = req.body;

    if (!DEPT_CODE || !VALUATION_TYPE) {
      return resMaker(
        1,
        [],
        "Please provide DEPT_CODE and VALUATION_TYPE",
        res
      );
    }

    const newEntry = new ValuationType({
      DEPT_CODE,
      VALUATION_TYPE,
    });

    await newEntry.save();

    return resMaker(0, newEntry, "Added Successfully", res);
  } catch (err) {
    console.error(err);
    return resMaker(1, err, "Could not add", res);
  }
});

router.post("/delete_valuation_type_by_id", checkAuth, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return resMaker(1, [], "ID is required", res);
    }

    await ValuationType.findByIdAndDelete(id);

    return resMaker(0, [], "Deleted Successfully", res);
  } catch (err) {
    console.error(err);
    return resMaker(1, err, "Could not delete", res);
  }
});

// Valuation Type End

// gr materials
router.post("/add_gr_materials", checkAuth, poolCreator, (req, response) => {
  const { MATERIAL } = req.body;

  connection.query(
    "INSERT INTO GR_MATERIALS SET ?",
    { MATERIAL },
    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not fetch", response);
      } else {
        return resMaker(0, results, "Fetched", response);
      }
    }
  );
});

router.post(
  "/delete_gr_materials_by_id",
  checkAuth,
  poolCreator,
  (req, response) => {
    let id = req.body.id;

    connection.query(
      "DELETE FROM GR_MATERIALS WHERE id = ?",
      id,
      (err, results) => {
        if (err) {
          return resMaker(1, err, "Could not fetch", response);
        } else {
          return resMaker(0, results, "Fetched", response);
        }
      }
    );
  }
);

router.post("/sales_promoter", checkAuth, poolCreator, (req, response) => {
  // const data =  req.body.lv_customer.toString();

  const pool = req.pool;
  if (Object.entries(req.body).length == 0) {
    return resMaker(
      1,
      [],
      "Please Enter Atleast One Value To Get Results",
      response
    );
  }

  handleClientCall(pool, "ZFM_SALES_PROMOTER", { ...req.body }, response);
});

router.post("/trans_zone", checkAuth, poolCreator, (req, response) => {
  // const data =  req.body.lv_customer.toString();
  const pool = req.pool;

  if (Object.entries(req.body).length == 0) {
    return resMaker(
      1,
      [],
      "Please Enter Atleast One Value To Get Results",
      response
    );
  }

  handleClientCall(pool, "ZFM_TRANS_ZONE", { ...req.body }, response);
});

function resMaker(code, result, msg, res) {
  if (code == 0) {
    res.json({ status: true, code: code, result: result, msg: msg });
  } else {
    res.json({ status: false, code: code, result: result, msg: msg });
  }
}

router.post("/get-new-shipping-type", checkAuth, poolCreator, (req, res) => {
  let plant = req.body.plant;
  let material = req.body.material;

  const pool = req.pool;

  if (plant && material) {
    pool
      .acquire()
      .then((client) => {
        client
          .call("ZRFC_PLNT_MAT_SHIP_TYPE", {
            PLANT: plant,
            MATERIAL: material,
          })
          .then((data, err) => {
            if (data.IT_FINAL) {
              res.json({
                status: true,
                msg: "fetched new shipping type.",
                data: data.IT_FINAL,
              });
            } else {
              res.json({
                status: false,
                msg: "server error.",
              });
            }
          })
          .catch((err) => {
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  } else {
    res.json({
      status: false,
      msg: "Please provide valid inputs",
    });
  }
});

router.post(
  "/sales-order-login-matrix-check",
  checkAuth,
  poolCreator,
  (req, res, next) => {
    const pool = req.pool;
    pool
      .acquire()
      .then((client) => {
        client
          .call("ZRFC_SO_CREATE_LOGIN_MTX_CHK", {
            IM_KUNNR: req.body.IM_KUNNR,
            IM_LOGIN_ID: req.body.lv_user,
            IM_WERKS: req.body.IM_WERKS,
            IM_VKORG: req.body.IM_VKORG,
            IM_VTWEG: req.body.IM_VTWEG,
            IM_SPART: req.body.IM_SPART,
          })
          .then((data) => {
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
            res.json({
              status: false,
              msg: "server error.",
            });
          })
          .finally(() => {
            pool.release(client, function () {});
          });
      })
      .catch((err) => {
        res.json({
          status: false,
          msg: "server error.",
        });
      });
  }
);

router.post(
  "/common_post_with_fm_name",
  checkAuth,
  poolCreator,
  (req, response) => {
    // const data =  req.body.lv_customer.toString();
    const pool = req.pool;

    if (Object.entries(req.body).length == 0) {
      return resMaker(
        1,
        [],
        "Please Enter Atleast One Value To Get Results",
        response
      );
    }

    handleClientCall(
      pool,
      "" + req.body.fm_name,
      { ...req.body.params },
      response
    );
  }
);

router.post("/common_post_with_table_name", checkAuth, async (req, res) => {
  const { TABLE, params, distinctKey } = req.body;

  // Check if required fields are provided
  if (!TABLE) {
    return resMaker(
      1,
      [],
      "Please Enter Atleast One Value To Get Results",
      res
    );
  }

  const keys = Object.keys(params);
  const values = Object.values(params);
  let sql = `SELECT * FROM ${TABLE}`;

  if (keys.length > 0) {
    const placeholders = keys.map(() => "?").join(", ");
    const conditions = keys.map((key) => `${key} = ?`).join(" AND ");
    sql += ` WHERE ${conditions}`;
  }

  if (distinctKey) {
    sql = `SELECT DISTINCT ${distinctKey}, * FROM ${TABLE} WHERE ${keys
      .map((key) => `${key} = ?`)
      .join(" AND ")}`;
  }

  try {
    const results = await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return resMaker(0, results, "Fetched", res);
  } catch (err) {
    console.error(err);
    return resMaker(1, err, "Could not fetch", res);
  }
});

// get shipping type from table
router.post("/get_shipping_type_from_table", checkAuth, async (req, res) => {
  const { params } = req.body;
  connection.query(
    "SELECT * FROM SHIPPING_TYPE_MAINTAINED WHERE PLANT = ? AND MATERIAL = ?",
    [params.PLANT, params.MATERIAL],
    (err, results) => {
      if (err) {
        console.error(err);
        return resMaker(1, err, "Could not fetch", res);
      }
      if (results.length > 0) {
        return resMaker(0, results, "Fetched", res);
      } else {
        connection.query("SELECT * FROM SHIPPING_TYPE", (err, results) => {
          if (err) {
            console.error(err);
            return resMaker(1, err, "Could not fetch", res);
          }
          return resMaker(0, results, "Fetched", res);
        });
      }
    }
  );
});

// add shipping type in SHIPPING_TYPE_MAINTAINED table
router.post("/add_shipping_type_maintained", checkAuth, async (req, res) => {
  const params = req.body;
  console.log(params);
  connection.query(
    "INSERT INTO SHIPPING_TYPE_MAINTAINED SET ?",
    params,
    (err, results) => {
      if (err) {
        console.error(err);
        return resMaker(1, err, "Could not fetch", res);
      } else {
        return resMaker(0, results, "Fetched", res);
      }
    }
  );
});

// delete shipping type in SHIPPING_TYPE_MAINTAINED table by id
router.post(
  "/delete_shipping_type_maintained_by_id",
  checkAuth,
  async (req, res) => {
    let id = req.body.id;
    connection.query(
      "DELETE FROM SHIPPING_TYPE_MAINTAINED WHERE id = ?",
      id,
      (err, results) => {
        if (err) {
          return resMaker(1, err, "Could not fetch", res);
        } else {
          return resMaker(0, results, "Fetched", res);
        }
      }
    );
  }
);

// add row to table USER_DEPOT_MAP columns names USER_CODE and DEPOT
router.post("/add_user_depot_map", checkAuth, async (req, res) => {
  const { USER_CODE, DEPOT, USER_TYPE } = req.body;

  connection.query(
    "INSERT INTO USER_DEPOT_MAP SET ?",
    { USER_CODE, DEPOT, USER_TYPE },

    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not fetch", res);
      } else {
        return resMaker(0, results, "Fetched", res);
      }
    }
  );
});

// delete row from table USER_DEPOT_MAP by id
router.post("/delete_user_depot_map_by_id", checkAuth, async (req, res) => {
  let id = req.body.id;

  connection.query(
    "DELETE FROM USER_DEPOT_MAP WHERE id = ?",
    id,
    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not fetch", res);
      } else {
        return resMaker(0, results, "Fetched", res);
      }
    }
  );
});

// get all the user where user_type is 3 and 4
router.post("/get_all_users_by_user_type", checkAuth, async (req, res) => {
  connection.query(
    "SELECT * FROM users WHERE user_type IN (4,5)",
    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not fetch", res);
      } else {
        return resMaker(0, results, "Fetched", res);
      }
    }
  );
});

// Add rr permission
router.post("/add_rr_permission", checkAuth, async (req, res) => {
  const { user_code, rr_no } = req.body;

  //   CREATE TABLE my_table (
  //     AUTHORIZED_BY VARCHAR(255),
  //     RR_NO VARCHAR(255),
  //     CREATED_AT DATETIME
  // );

  // current time stamp
  const currentTimeStamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  connection.query(
    "INSERT INTO rr_permissions (AUTHORIZED_BY, RR_NO, CREATED_AT) VALUES (?, ?, ?)",
    [user_code, rr_no, currentTimeStamp],
    (err, results) => {
      if (err) {
        return resMaker(1, err, "Could not add rr permission", res);
      } else {
        return resMaker(0, results, "Added rr permission", res);
      }
    }
  );
});

router.post("/common_sap_pass_check", (req, response) => {
  let rfcSettings = {
    user: "dpportal",
    passwd: "Bcl@1234",
    mshost: "sapprdci",
    sysid: "BCP",
    group: "PARIVARDHAN",
    client: "700",
    low: 4,
    high: 20,
  };

  const pool = new rfc.Pool(rfcSettings);

  if (Object.entries(req.body).length == 0) {
    return resMaker(
      1,
      [],
      "Please Enter At least One Value To Get Results",
      response
    );
  }

  handleClientCall(
    pool,
    "" + req.body.fm_name,
    { ...req.body.params },
    response
  );
});

module.exports = router;
