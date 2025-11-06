const express = require("express");
const router = express.Router();
const mongo = require("mongoose");
const connection = require("../connections/connection");
const DamageDataModel = require("../schema/DamageDataSchema");
const RegionDepotMapModel = require("../schema/RegionDepotMap");
const sendEmail = require("../util/sendMail");

// ATBBTqaJdvkHXaxFKUuKbnAnNE2c7C89FA23

const physicalInventorySchema = new mongo.Schema(
  {
    PHY_ID: String,
    PHY_DATE: String,
    PHY_TIME: String,
    PHY_INVT: [Object],
    BOOK_STOCK: [Object],
    DEPOTS: [Object],
    CFA_NAME: String,
    CFA_CODE: String,
    COMP_CODE: String,
    COMP_NAME: String,
    REGION_CODE: String,
    REGION_NAME: String,
  },
  {
    timestamps: true,
  }
);

const PhysicalInventoryModel = mongo.model(
  "PhysicalInventory",
  physicalInventorySchema
);

// create physical inventory
router.post("/create-physical-inventory", (req, res) => {
  const physicalInventory = new PhysicalInventoryModel({
    PHY_ID: req.body.PHY_ID,
    PHY_DATE: req.body.PHY_DATE,
    PHY_TIME: req.body.PHY_TIME,
    PHY_INVT: req.body.PHY_INVT,
    BOOK_STOCK: req.body.BOOK_STOCK,
    DEPOTS: req.body.DEPOTS,
    CFA_NAME: req.body.CFA_NAME,
    CFA_CODE: req.body.CFA_CODE,
    COMP_CODE: req.body.COMP_CODE,
    COMP_NAME: req.body.COMP_NAME,
    REGION_CODE: req.body.REGION_CODE,
    REGION_NAME: req.body.REGION_NAME,
  });
  physicalInventory
    .save()
    .then((createdPhysicalInventory) => {
      res.status(201).json({
        message: "Physical Inventory added successfully",
        code: 0,
        status: true,
        data: createdPhysicalInventory,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Creating a Physical Inventory failed!",
        code: 1,
        status: false,
        data: error,
      });
    });
});

// get physical inventory by id
router.get("/get-physical-inventory/:id", (req, res) => {
  PhysicalInventoryModel.findOne({ PHY_ID: req.params.id }).then(
    (physicalInventory) => {
      if (physicalInventory) {
        res.status(200).json({
          message: "Physical Inventory fetched successfully!",
          code: 0,
          status: true,
          data: physicalInventory,
        });
      } else {
        res.status(200).json({
          message: "Physical Inventory not found!",
          code: 1,
          status: false,
          data: null,
        });
      }
    }
  );
});

// delete physical inventory by phy_id is a post function
router.post("/delete-physical-inventory/:id", (req, res) => {
  PhysicalInventoryModel.deleteOne({ PHY_ID: req.params.id }).then((result) => {
    if (result) {
      res.status(200).json({
        message: "Physical Inventory deleted successfully",
        code: 0,
        status: true,
        data: result,
      });
    } else {
      res.status(200).json({
        message: "Physical Inventory not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// update physical inventory by phy_id is a put function
router.put("/update-physical-inventory/:id", (req, res) => {
  PhysicalInventoryModel.updateOne(
    { PHY_ID: req.params.id },
    {
      PHY_INVT: req.body.PHY_INVT,
      BOOK_STOCK: req.body.BOOK_STOCK,
      DEPOTS: req.body.DEPOTS,
    }
  ).then((result) => {
    if (result) {
      res.status(200).json({
        message: "Update successful!",
        code: 0,
        status: true,
        data: result,
      });
    } else {
      res.status(200).json({
        message: "Not authorized!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// get all physical inventory

router.post("/get-all-physical-inventory", (req, res) => {
  // get all physical inventory by cfa code and date range
  let query = {};

  if (req.body.CFA_CODE) {
    query.CFA_CODE = req.body.CFA_CODE;
  }

  if (req.body.REGION) {
    query.REGION_CODE = req.body.REGION;
  }

  if (req.body.IM_DATE_FROM && req.body.IM_DATE_TO) {
    query.PHY_DATE = {
      $gte: req.body.IM_DATE_FROM,
      $lte: req.body.IM_DATE_TO,
    };
  }

  if (req.body.REGION) {
    query.REGION_CODE = req.body.REGION;
  }

  PhysicalInventoryModel.find({
    ...query,
  }).then((physicalInventory) => {
    if (physicalInventory) {
      res.status(200).json({
        message: "Physical Inventory fetched successfully!",
        code: 0,
        status: true,
        data: physicalInventory,
      });
    } else {
      res.status(200).json({
        message: "Physical Inventory not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

router.post("/get-compliance-report", (req, res) => {
  // get all physical inventory by cfa code and date range and region code and comp code and deport array

  let query = {};

  if (req.body.CFA_CODE) {
    query.CFA_CODE = req.body.CFA_CODE;
  }

  if (req.body.IM_DATE_FROM && req.body.IM_DATE_TO) {
    query.PHY_DATE = {
      $gte: req.body.IM_DATE_FROM,
      $lte: req.body.IM_DATE_TO,
    };
  }

  if (req.body.REGION_CODE) {
    query.REGION_CODE = req.body.REGION_CODE;
  }

  if (req.body.COMP_CODE) {
    query.COMP_CODE = req.body.COMP_CODE;
  }

  if (req.body.DEPOT.length) {
    query.DEPOTS = {
      $elemMatch: {
        $or: req.body.DEPOT.map((depot) => {
          return { value: depot };
        }),
      },
    };
  }

  PhysicalInventoryModel.find({
    ...query,
  })
    .select(
      "PHY_DATE PHY_TIME DEPOTS CFA_NAME CFA_CODE COMP_CODE COMP_NAME REGION_CODE REGION_NAME"
    )
    .then((physicalInventory) => {
      if (physicalInventory) {
        res.status(200).json({
          message: "Physical Inventory fetched successfully!",
          code: 0,
          status: true,
          data: physicalInventory,
        });
      } else {
        res.status(200).json({
          message: "Physical Inventory not found!",
          code: 1,
          status: false,
          data: null,
        });
      }
    });
});

// create damage data
router.post("/create-damage-data", (req, res) => {
  const postData = req.body;

  let createData = {};

  for (let key in postData) {
    if (postData[key]) {
      createData[key] = postData[key];
    }
  }

  DamageDataModel.findOne({ RR_NO: postData.RR_NO }).then((result) => {
    if (result) {
      res.status(200).json({
        message: "Damage Data already exists!",
        code: 1,
        status: false,
        data: null,
      });
    } else {
      const damageData = new DamageDataModel({
        ...createData,
      });

      damageData
        .save()
        .then((createdDamageData) => {
          res.status(201).json({
            message: "Damage Data added successfully",
            code: 0,
            status: true,
            data: createdDamageData,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Creating a Damage Data failed!",
            code: 1,
            status: false,
            data: error,
          });
        });
    }
  });
});

// update damage data by mat_doc is a post function
router.post("/update-damage-data/:id", (req, res) => {
  const postData = req.body;

  let updateData = {};

  for (let key in postData) {
    if (postData[key]) {
      updateData[key] = postData[key];
    }
  }

  DamageDataModel.updateOne(
    { MAT_DOC: req.params.id },
    {
      ...updateData,
    }
  ).then((result) => {
    if (result) {
      res.status(200).json({
        message: "Update successful!",
        code: 0,
        status: true,
        data: result,
      });
    } else {
      res.status(200).json({
        message: "Not authorized!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// get damage data by mat_doc
router.get("/get-damage-data/:id", (req, res) => {
  DamageDataModel.findOne({ MAT_DOC: req.params.id }).then((damageData) => {
    if (damageData) {
      res.status(200).json({
        message: "Damage Data fetched successfully!",
        code: 0,

        status: true,
        data: damageData,
      });
    } else {
      res.status(200).json({
        message: "Damage Data not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// get all damage data by cfa code and date range
router.post("/get-all-damage-data", (req, res) => {
  let query = {};

  if (req.body.USER_ID) {
    query.USER_ID = req.body.USER_ID;
  }

  DamageDataModel.find({
    ...query,
  }).then((damageData) => {
    if (damageData) {
      res.status(200).json({
        message: "Damage Data fetched successfully!",
        code: 0,
        status: true,
        data: damageData,
      });
    } else {
      res.status(200).json({
        message: "Damage Data not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// new api for get all damage data
router.post("/create-rake-data", (req, res) => {
  const postData = req.body;

  let createData = {};

  for (let key in postData) {
    if (postData[key]) {
      createData[key] = postData[key];
    }
  }

  DamageDataModel.findOne({ RR_NO: postData.RR_NO }).then((result) => {
    if (result) {
      res.status(200).json({
        message: "Rake Data already exists!",
        code: 1,
        status: false,
        data: result,
      });
    } else {
      const damageData = new DamageDataModel({
        ...createData,
      });

      damageData
        .save()
        .then((createdDamageData) => {
          res.status(201).json({
            message: "Rake Data added successfully",
            code: 0,
            status: true,
            data: createdDamageData,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Creating a Rake Data failed!",
            code: 1,
            status: false,
            data: error,
          });
        });
    }
  });
});

// update damage data by rr_no is a post function
router.post("/update-rake-data/:id", async (req, res) => {
  const postData = req.body;

  let updateData = {};

  for (let key in postData) {
    if (postData[key] || postData[key] === null) {
      updateData[key] = postData[key];
    }
  }

  const result = await DamageDataModel.updateOne(
    { RR_NO: req.params.id },
    {
      ...updateData,
    }
  );

  if (postData.sendMail) {
    const damageData = await DamageDataModel.findOne({ RR_NO: req.params.id });

    const location = [
      ...new Set(
        damageData.DOCUMENT.map((item) => {
          return item.DEPOT_LOCATION;
        })
      ),
    ].join(", ");

    let totalDamage = 0;
    let cut_torn = 0;

    // Loop through the dataArray
    for (const data of damageData.DAMAGE_DATA) {
      totalDamage += data.TOTAL_DMG;
      cut_torn += Number(data.CUT_TORN);
    }

    const damagePercentage = (totalDamage / Number(damageData.RR_QTY)) * 100;

    // Extract year, month, and day
    const year = damageData.DATE_OF_RAKE_RECEIVED.slice(0, 4);
    const month = damageData.DATE_OF_RAKE_RECEIVED.slice(4, 6);
    const day = damageData.DATE_OF_RAKE_RECEIVED.slice(6, 8);

    // Format the date as "DD/MM/YYYY"
    const formattedDate = `${day}/${month}/${year}`;

    const rrData = await DamageDataModel.aggregate([
      {
        $match: {
          RR_NO: req.params.id,
        },
      },
      { $unwind: "$DOCUMENT" },
      { $group: { _id: null, uniqueDepots: { $addToSet: "$DOCUMENT.DEPOT" } } },
    ]);

    let allDepots = rrData[0].uniqueDepots;

    console.log(allDepots);

    connection.query(
      `SELECT DEPOT, USER_CODE FROM USER_DEPOT_MAP WHERE DEPOT IN (${allDepots
        .map((depot) => `"${depot}"`)
        .join(",")})`,
      (queryError, rows) => {
        if (queryError) {
          console.error("Error fetching data:", queryError);
          connection.end();
          return;
        }

        rows.forEach((row) => {
          connection.query(
            `SELECT * FROM users WHERE user_code = '${row.USER_CODE}'`,
            (userDataError, userData) => {
              if (userDataError) {
                console.error("Error fetching user data:", userDataError);
                return;
              }

              let baseurl = "https://dpnportal.birlacorp.com";
              let mailObject = {
                subject: "RR Data is entered and needs to approve",
                html: `
                   <p>Dear ${userData[0].name ? userData[0].name : "User"},</p>
                   <p>The following RR Data has been updated and requires your approval.</p>
                   <table style="border-collapse: collapse; width: 100%;">
                     <thead>
                       <tr>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">RR No.</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">RR Date</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">Location</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">Rake Data Entered by CFA</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">RR Qty.MT</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">Total Damage & Cut/Torn</th>
                         <th style="border: 1px solid black; padding: 8px; text-align: left;">Damage%</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${
                           req.params.id
                         }</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${formattedDate}</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${location}</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${
                           damageData.HANDLING_PARTY
                         }</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${
                           damageData.RR_QTY
                         }</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${totalDamage} & ${cut_torn}</td>
                         <td style="border: 1px solid black; padding: 8px; text-align: left;">${damagePercentage.toFixed(
                           2
                         )}%</td>
                       </tr>
                       <!-- Add more rows as needed -->
                     </tbody>
                   </table>
                   <p>Please review the updated rake data and take necessary action.</p>
                   <p>You can access the updated data through the following link:</p>
                   <a href="${baseurl}/dashboard/damage-data-entry/rake-handling-data/${
                  req.params.id
                }?editOnly=true&view=true">Click here to view and approve the data</a>
                    <br/>
                   <p>Thank You,</p>
                   <p>Team MP Birla Group</p>
                `,
              };

              if (postData.CLAIMED) {
                if (
                  userData.length > 0 &&
                  userData[0].email &&
                  userData[0].user_type === 5
                ) {
                  let to = userData[0].email;
                  sendEmail({ ...mailObject, to });
                }
              } else if (postData.CS_APPROVED) {
                if (
                  userData.length > 0 &&
                  userData[0].email &&
                  userData[0].user_type === 4
                ) {
                  let to = userData[0].email;
                  sendEmail({
                    ...mailObject,
                    to,
                  });
                }
              } else if (postData.BH_APPROVED) {
                if (
                  userData.length > 0 &&
                  userData[0].email &&
                  userData[0].user_type === 6
                ) {
                  let to = userData[0].email;
                  sendEmail({
                    ...mailObject,
                    to,
                  });
                }
              } else {
                console.log("Do Nothing");
              }
            }
          );
        });
      }
    );
  }

  if (result) {
    res.status(200).json({
      message: "Rake data update successful!",
      code: 0,
      status: true,
      data: result,
    });
  } else {
    res.status(200).json({
      message: "RR No not found!",
      code: 1,
      status: false,
      data: null,
    });
  }
});

// get damage data by rr_no
router.get("/get-rake-data/:id", (req, res) => {
  DamageDataModel.findOne({ RR_NO: req.params.id }).then((damageData) => {
    if (damageData) {
      res.status(200).json({
        message: "Rake Data fetched successfully!",
        code: 0,
        status: true,
        data: damageData,
      });
    } else {
      res.status(200).json({
        message: "Rake Data not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// get all damage data by cfa code and date range
router.post("/get-all-rake-data", (req, res) => {
  let query = {};

  if (req.body.USER_ID) {
    query.USER_ID = req.body.USER_ID;
  }

  if (req.body.DEPOT) {
    query.DEPOT = req.body.DEPOT;
  }

  if (req.body.IM_DATE_FROM && req.body.IM_DATE_TO) {
    query.DATE_OF_RAKE_RECEIVED = {
      $gte: req.body.IM_DATE_FROM,
      $lte: req.body.IM_DATE_TO,
    };
  }

  DamageDataModel.find({
    ...query,
  }).then((damageData) => {
    if (damageData) {
      res.status(200).json({
        message: "Rake Data fetched successfully!",
        code: 0,
        status: true,
        data: damageData,
      });
    } else {
      res.status(200).json({
        message: "Rake Data not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

// get all the damage data by Depot in the document array and with date range
router.post("/get-all-rake-data-by-depot", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  if (data.IM_DATE_FROM && data.IM_DATE_TO) {
    query.IM_DATE = {
      $gte: data.IM_DATE_FROM,
      $lte: data.IM_DATE_TO,
    };
  }

  console.log(query);

  const damageData = await DamageDataModel.find({
    "DOCUMENT.DEPOT": { $in: query.DEPOT },
    DATE_OF_RAKE_RECEIVED: { ...query.IM_DATE },
    $and: [{ APPROVED_CS: null, APPROVED_BH: null, APPROVED_LG: null }],
  });

  console.log(damageData);
  if (damageData) {
    res.json({
      result: damageData,
      msg: "Data by depot fetched Successfully",
      code: 0,
    });
  }
});

// get all the damage data by Depot in the document array and with date range
router.post("/get-all-rake-data-by-depot-cs-approved", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  if (data.IM_DATE_FROM && data.IM_DATE_TO) {
    query.IM_DATE = {
      $gte: data.IM_DATE_FROM,
      $lte: data.IM_DATE_TO,
    };
  }

  const damageData = await DamageDataModel.find({
    "DOCUMENT.DEPOT": { $in: query.DEPOT },
    DATE_OF_RAKE_RECEIVED: { ...query.IM_DATE },
    $and: [
      { APPROVED_CS: { $exists: true, $ne: null } },
      { APPROVED_BH: null },
    ],
  });

  if (damageData) {
    res.json({
      result: damageData,
      msg: "Data by depot fetched Successfully",
      code: 0,
    });
  }
});

// get all the damage data by Depot in the document array and with date range
router.post("/get-all-rake-data-by-depot-bh-approved", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  if (data.IM_DATE_FROM && data.IM_DATE_TO) {
    query.IM_DATE = {
      $gte: data.IM_DATE_FROM,
      $lte: data.IM_DATE_TO,
    };
  }

  const damageData = await DamageDataModel.find({
    "DOCUMENT.DEPOT": { $in: query.DEPOT },
    DATE_OF_RAKE_RECEIVED: { ...query.IM_DATE },
    $and: [
      { APPROVED_BH: { $exists: true, $ne: null } },
      { APPROVED_CS: { $exists: true, $ne: null } },
      { APPROVED_LG: null },
      { APPROVED_SA: null },
    ],
  });

  if (damageData) {
    res.json({
      result: damageData,
      msg: "Data by depot fetched Successfully",
      code: 0,
    });
  }
});

router.post("/get-all-rake-data-by-depot-lg-approved", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  if (data.IM_DATE_FROM && data.IM_DATE_TO) {
    query.IM_DATE = {
      $gte: data.IM_DATE_FROM,
      $lte: data.IM_DATE_TO,
    };
  }

  const damageData = await DamageDataModel.find({
    "DOCUMENT.DEPOT": { $in: query.DEPOT },
    DATE_OF_RAKE_RECEIVED: { ...query.IM_DATE },
    $and: [
      { APPROVED_BH: { $exists: true, $ne: null } },
      { APPROVED_CS: { $exists: true, $ne: null } },
      { APPROVED_LG: { $exists: true, $ne: null } },
      { APPROVED_SA: null },
    ],
  });

  if (damageData) {
    res.json({
      result: damageData,
      msg: "Data by depot fetched Successfully",
      code: 0,
    });
  }
});

// get all the damage data by Depot in the document array and with date range
router.post("/get-all-rake-data-by-depot-full-approved", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  if (data.IM_DATE_FROM && data.IM_DATE_TO) {
    query.IM_DATE = {
      $gte: data.IM_DATE_FROM,
      $lte: data.IM_DATE_TO,
    };
  }

  query.APPROVED_BH = { $exists: true, $ne: null };
  query.APPROVED_CS = { $exists: true, $ne: null };
  query.APPROVED_LG = { $exists: true, $ne: null };
  query.APPROVED_SA = { $exists: true, $ne: null };

  const damageData = await DamageDataModel.find({
    "DOCUMENT.DEPOT": { $in: query.DEPOT },
    DATE_OF_RAKE_RECEIVED: { ...query.IM_DATE },
    APPROVED_BH: { ...query.APPROVED_BH },
    APPROVED_CS: { ...query.APPROVED_CS },
    APPROVED_LG: { ...query.APPROVED_LG },
    APPROVED_SA: { ...query.APPROVED_SA },
  });

  if (damageData) {
    res.json({
      result: damageData,
      msg: "Data by depot fetched Successfully",
      code: 0,
    });
  }
});

// delivery added or not the RR
router.post("/delivery-added-or-not", async (req, res) => {
  const data = req.body;

  if (data.length === 0) {
    res.json({ result: [], msg: "Data fetched Successfully", code: 0 });
  }

  let DELIVERY_NO = data.map((item) => item.DELIVERY_NO);

  // Find all unique delivery numbers in the DOCUMENT array
  const deliveryNumbers = await DamageDataModel.distinct(
    "DOCUMENT.DELIVERY_NO"
  );

  // let DELIVERY_NO_SET = new Set(DELIVERY_NO);

  // //  filter the delivery numbers
  // let filteredDeliveryNumbers = deliveryNumbers.filter(
  //   (item) => !DELIVERY_NO_SET.has(item)
  // );

  // console.log(filteredDeliveryNumbers);

  let deliveryNumbersSet = new Set(deliveryNumbers);

  //  filter the delivery numbers
  let filteredDeliveryNumbers = DELIVERY_NO.filter(
    (item) => !deliveryNumbersSet.has(item)
  );

  console.log(filteredDeliveryNumbers);

  //   make that array object by data
  const deliveryData = filteredDeliveryNumbers.map((item) => {
    return data.find((dataItem) => dataItem.DELIVERY_NO === item);
  });

  res.json({ result: deliveryData, msg: "Data fetched Successfully", code: 0 });
});

// check delivery number mapped with rr
router.post("/check-delivery-number-mapped-with-rr", async (req, res) => {
  const data = req.body;

  let DELIVERY_NO = data.map((item) => item.DELIVERY_NO);

  // find all the rr numbers with delivery number is already mapped in the document array
  const deliveryNumbers = await DamageDataModel.find({
    "DOCUMENT.DELIVERY_NO": { $in: DELIVERY_NO },
  });

  // map the RR number from the delivery numbers to data
  const deliveryData = data.map((item) => {
    const deliveryNumber = deliveryNumbers.find((deliveryNumber) =>
      deliveryNumber.DOCUMENT.find(
        (document) => document.DELIVERY_NO === item.DELIVERY_NO
      )
    );
    return { ...item, RR_NO: deliveryNumber ? deliveryNumber.RR_NO : "" };
  });

  res.json({
    result: deliveryData,
    msg: "Data fetched Successfully",
    code: 0,
  });
});

// delete rake data by rr_no
router.delete("/delete-rake-data/:id", (req, res) => {
  DamageDataModel.deleteOne({ RR_NO: req.params.id })
    .then((data) => {
      res.json({
        status: true,
        msg: "Rake Data deleted successfully!",
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

// delete rake data by delivery_no
router.get("/get-rake-data-by-delivery-no/:id", (req, res) => {
  if (!req.params.id) {
    res.json({
      status: false,
      msg: "Delivery No not provided.",
    });
  }

  DamageDataModel.find({
    "DOCUMENT.DELIVERY_NO": req.params.id,
  })
    .then((data) => {
      res.json({
        status: true,
        data: data,
        msg: "Rake Data deleted successfully!",
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

// delete rake data by rr_no post
router.post("/delete-rake-data-post", (req, res) => {
  if (!req.body.RR_NO) {
    res.json({
      status: false,
      msg: "RR No not provided.",
    });
  }

  DamageDataModel.deleteOne({ RR_NO: req.body.RR_NO })
    .then((data) => {
      res.json({
        status: true,
        msg: "Rake Data deleted successfully!",
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

// get damage data by rr_no
router.post("/get-rake-data-post", (req, res) => {
  if (!req.body.RR_NO) {
    res.json({
      status: false,
      msg: "RR No not provided.",
    });
  }

  DamageDataModel.findOne({ RR_NO: req.body.RR_NO }).then((damageData) => {
    if (damageData) {
      res.status(200).json({
        message: "Rake Data fetched successfully!",
        code: 0,
        status: true,
        data: damageData,
      });
    } else {
      res.status(200).json({
        message: "Rake Data not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

router.post("/claim-intimation", async (req, res) => {
  const data = req.body;

  const updateData = await DamageDataModel.updateOne(
    {
      RR_NO: data["Rr Number"],
    },
    {
      $set: {
        CLAIM_INTIMATION_STATUS: "YES",
      },
    }
  );

  if (updateData) {
    let htmlTable = '<table border="1">';
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        htmlTable += `<tr><td><b>${key}</b></td><td>${data[key]}</td></tr>`;
      }
    }
    htmlTable += "</table>";

    let toMail = [
      "dhruba.roy@relianceada.com",
      "indranil.s.bhadra@relianceada.com",
      "Somen.Rana@relianceada.com",
      "yogesh.rajput@birlacorp.com",
      "pijero2792@tupanda.com",
      data["Email Id"] || "",
    ];

    await sendEmail({
      subject: `Claim Intimation on RR No:${data["Rr Number"]}`,
      html: htmlTable,
      to: toMail,
    });
    res.json({
      result: updateData,
      msg: "Mail sent Successfully",
      code: 0,
    });
  } else {
    res.json({
      result: null,
      msg: "No Data",
      code: 1,
    });
  }
});

router.post("/send-mail", async (req, res) => {
  sendEmail();
});

const getFiscalYearDates = (year) => {
  const startYear = year - 1;
  const startDate = `${startYear}0401`;
  const endDate = `${year}0331`;

  return { startDate, endDate };
};

router.post("/get-damage-summary-report", async (req, res) => {
  const { IM_DATE_FROM, IM_DATE_TO, IM_REGIO, IM_WHOUSE, IM_UNIT } = req.body;

  let summaryReport = [];

  if (IM_REGIO.length > 0) {
    const pipeline = [
      {
        $match: {
          DATE_OF_RAKE_RECEIVED: { $gte: IM_DATE_FROM, $lte: IM_DATE_TO },
        },
      },
      {
        $lookup: {
          from: "regiondepotmaps", // Use the dynamic variable here
          localField: "DEPOT",
          foreignField: "DEPOT",
          as: "mapping",
        },
      },
      {
        $unwind: "$mapping",
      },
      {
        $addFields: {
          REGION: "$mapping.REGION",
        },
      },
      {
        $match: {
          REGION: {
            $in: IM_REGIO,
          },
        },
      },
      {
        $addFields: {
          RR_QTY: {
            $convert: {
              input: "$RR_QTY",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          CLAIM_QTY: {
            $convert: {
              input: "$CLAIM_QTY",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },

          DAMAGE_QTY: {
            $sum: {
              $map: {
                input: {
                  $ifNull: ["$DAMAGE_DATA", []],
                },
                as: "dmg",
                in: {
                  $convert: {
                    input: "$$dmg.TOTAL_DMG",
                    to: "double",
                    onError: 0,
                    onNull: 0,
                  },
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$REGION",
          total_RR_QTY: { $sum: "$RR_QTY" },
          total_CLAIM_QTY: { $sum: "$CLAIM_QTY" },
          total_DAMAGE_QTY: { $sum: "$DAMAGE_QTY" },
          total_NON_CLAIM_QTY: {
            $sum: {
              $subtract: ["$DAMAGE_QTY", "$CLAIM_QTY"],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    summaryReport = await DamageDataModel.aggregate(pipeline).exec();
  } else {
    const depotPipeline = [
      {
        $match: {
          DEPOT: { $in: IM_WHOUSE },
          DATE_OF_RAKE_RECEIVED: {
            $gte: IM_DATE_FROM,
            $lte: IM_DATE_TO,
          },
        },
      },
      {
        $addFields: {
          RR_QTY: {
            $convert: {
              input: "$RR_QTY",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          CLAIM_QTY: {
            $convert: {
              input: "$CLAIM_QTY",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },

          DAMAGE_QTY: {
            $sum: {
              $map: {
                input: {
                  $ifNull: ["$DAMAGE_DATA", []],
                },
                as: "dmg",
                in: {
                  $convert: {
                    input: "$$dmg.TOTAL_DMG",
                    to: "double",
                    onError: 0,
                    onNull: 0,
                  },
                },
              },
            },
          },
          MFG_PLANT_FLAT: {
            $map: {
              input: {
                $ifNull: ["$DAMAGE_DATA.COMBINED_MATERIAL", []],
              },
              as: "mat",
              in: {
                $cond: [
                  { $isArray: "$$mat.MFG_PLANT" },
                  {
                    $arrayElemAt: ["$$mat.MFG_PLANT", 0],
                  },
                  "$$mat.MFG_PLANT",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          FIRST_MFG_PLANT: {
            $arrayElemAt: ["$MFG_PLANT_FLAT", 0],
          },
        },
      },
      {
        $group: {
          _id: {
            DEPOT: "$DEPOT",
            MFG_PLANT: "$FIRST_MFG_PLANT",
          },
          total_RR_QTY: { $sum: "$RR_QTY" },
          total_CLAIM_QTY: { $sum: "$CLAIM_QTY" },
          total_DAMAGE_QTY: { $sum: "$DAMAGE_QTY" },
          total_NON_CLAIM_QTY: {
            $sum: {
              $subtract: ["$DAMAGE_QTY", "$CLAIM_QTY"],
            },
          },
        },
      },
      {
        $addFields: {
          ID: {
            $concat: ["$_id.DEPOT", "_", "$_id.MFG_PLANT"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          ID: 1,
          DEPOT: "$_id.DEPOT",
          MFG_PLANT: "$_id.MFG_PLANT",
          total_RR_QTY: 1,
          total_CLAIM_QTY: 1,
          total_DAMAGE_QTY: 1,
          total_NON_CLAIM_QTY: 1,
        },
      },
    ];

    summaryReport = await DamageDataModel.aggregate(depotPipeline).exec();
  }

  res.json({
    result: summaryReport,
    msg: "RR Summary Report fetched Successfully",
    code: 0,
  });
});

router.post("/update-region-depot-map", async (req, res) => {
  const data = req.body;

  // delete the whole collection
  await RegionDepotMapModel.deleteMany({});

  // insert all the new data
  await RegionDepotMapModel.insertMany(data);

  res.json({
    result: null,
    msg: "Region Depot Map updated Successfully",
    code: 0,
  });
});

router.post("/get-all-region-depot-map", async (req, res) => {
  const data = req.body;

  let query = {};

  if (data.REGION) {
    query.REGION = data.REGION;
  }

  if (data.DEPOT) {
    query.DEPOT = data.DEPOT;
  }

  RegionDepotMapModel.find({
    ...query,
  }).then((regionDepotMap) => {
    if (regionDepotMap) {
      res.status(200).json({
        message: "Region Depot Map fetched successfully!",
        code: 0,
        status: true,
        data: regionDepotMap,
      });
    } else {
      res.status(200).json({
        message: "Region Depot Map not found!",
        code: 1,
        status: false,
        data: null,
      });
    }
  });
});

router.delete("/delete-region-depot-map-by-depot/:id", async (req, res) => {
  await RegionDepotMapModel.deleteOne({
    _id: req.params.id,
  });

  res.json({
    result: null,
    msg: "Region Depot Map deleted Successfully",
    code: 0,
  });
});

module.exports = router;

//  Testing Pipeline

// const pipelineDepot = [
//   {
//     $group: {
//       _id: "$REGION",
//       DEPOTS: { $addToSet: "$DEPOT" },
//     },
//   },
//   {
//     $project: {
//       _id: 0,
//       REGION: "$_id",
//       DEPOTS: 1,
//     },
//   },
// ];

// const regionDepotMap = await RegionDepotMapModel.aggregate(
//   pipelineDepot
// ).exec();

// console.log(regionDepotMap);

// const pipeline = [];

// // Add match stage to filter by date range and depots
// pipeline.push({
//   $match: {
//     DATE_OF_RAKE_RECEIVED: { $gte: startDate, $lte: endDate },
//     DEPOT: { $in: regionDepotMap.flatMap((region) => region.DEPOTS) },
//   },
// });

// // Convert RR_QTY from string to number
// pipeline.push({
//   $addFields: {
//     RR_QTY: { $toDouble: "$RR_QTY" },
//   },
// });

// // Unwind the region-depot map array to create individual records for each depot
// pipeline.push({
//   $unwind: {
//     path: "$DEPOT",
//     includeArrayIndex: "regionIndex",
//   },
// });

// // Lookup the region for each depot
// const regionLookup = regionDepotMap.reduce((acc, region) => {
//   region.DEPOTS.forEach((depot) => {
//     acc[depot] = region.REGION;
//   });
//   return acc;
// }, {});

// // Map each document to its region
// pipeline.push({
//   $addFields: {
//     REGION: {
//       $arrayElemAt: [
//         Object.entries(regionLookup).map(([depot, region]) => ({
//           $cond: [{ $eq: ["$DEPOT", depot] }, region, null],
//         })),
//         0,
//       ],
//     },
//   },
// });

// // Group by region and calculate the total RR_QTY and CLAIM_QTY
// pipeline.push({
//   $group: {
//     _id: "$REGION",
//     total_RR_QTY: { $sum: "$RR_QTY" },
//     total_CLAIM_QTY: { $sum: "$CLAIM_QTY" },
//   },
// });

// // Sort by region
// pipeline.push({
//   $sort: { _id: 1 },
// });

// console.log(pipeline);
