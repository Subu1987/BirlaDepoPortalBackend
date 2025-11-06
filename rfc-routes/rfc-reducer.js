const express = require("express");
const router = express.Router();
const PlantMaterial = require("../schema/PlantMaterial");
const UserPlant = require("../schema/UserPlant");
const Plant = require("../schema/PlantSchema");
// CFA User
const User = require("../schema/UserPermissionSchema");
const CFAUser = require("../schema/CFADepotMap");
const CompanyCFAReg = require("../schema/CFACompRegMap");

// Log
const Log = require("../schema/LogSchema");

// response handler
function resMaker(
  res,
  statusCode,
  success,
  message,
  data = null,
  error = null
) {
  res.status(statusCode).json({
    status: success,
    code: success ? 0 : 1,
    msg: message,
    data: data,
    error: error,
  });
}

/** All Users */
// Create a Plant
router.post("/create-plant-material", (req, res) => {
  const newPlant = new PlantMaterial(req.body);
  newPlant
    .save()
    .then((plant) => resMaker(res, 201, true, "Created", plant))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Get a Plant by LV_PLANT
router.post("/get-plant-material", (req, res) => {
  const { lv_plant } = req.body;
  if (!lv_plant) {
    return res.json({ status: false, msg: "LV_PLANT not provided." });
  }

  PlantMaterial.findOne({ LV_PLANT: lv_plant })
    .select(" -_id -__v -createdAt -updatedAt")
    .then((plant) => {
      if (plant) {
        res.status(200).json({ status: true, msg: "Fetched", result: plant });
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update a Plant by LV_PLANT
router.post("/update-plant-material", (req, res) => {
  const { LV_PLANT, updateData } = req.body;
  if (!LV_PLANT) {
    return res.json({ status: false, msg: "LV_PLANT not provided." });
  }

  PlantMaterial.findOneAndUpdate({ LV_PLANT }, updateData, { new: true })
    .then((plant) => {
      if (plant) {
        resMaker(res, 200, true, "Updated", plant);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete a Plant by LV_PLANT
router.post("/delete-plant-material", (req, res) => {
  const { LV_PLANT } = req.body;
  if (!LV_PLANT) {
    return res.json({ status: false, msg: "LV_PLANT not provided." });
  }

  PlantMaterial.findOneAndDelete({ LV_PLANT })
    .then((plant) => {
      if (plant) {
        resMaker(res, 200, true, "Deleted", plant);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Create a UserPlant
router.post("/create-user-plant", (req, res) => {
  const newUserPlant = new UserPlant(req.body);
  newUserPlant
    .save()
    .then((userPlant) => resMaker(res, 201, true, "Created", userPlant))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Get a UserPlant by LV_USER
router.post("/get-user-plant", (req, res) => {
  const { LV_USER } = req.body;
  if (!LV_USER) {
    return res.json({ status: false, msg: "LV_USER not provided." });
  }

  UserPlant.findOne({ LV_USER })
    .select(" -_id -__v -createdAt -updatedAt")
    .then((userPlant) => {
      if (userPlant) {
        resMaker(res, 200, true, "Fetched", userPlant);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update a UserPlant by LV_USER
router.post("/update-user-plant", (req, res) => {
  const { LV_USER, plants } = req.body;
  if (!LV_USER) {
    return res.json({ status: false, msg: "LV_USER not provided." });
  }

  UserPlant.findOneAndUpdate({ LV_USER }, plants, { new: true })
    .then((userPlant) => {
      if (userPlant) {
        resMaker(res, 200, true, "Updated", userPlant);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete a UserPlant by LV_USER
router.post("/delete-user-plant", (req, res) => {
  const { LV_USER } = req.body;
  if (!LV_USER) {
    return res.json({ status: false, msg: "LV_USER not provided." });
  }

  UserPlant.findOneAndDelete({ LV_USER })
    .then((userPlant) => {
      if (userPlant) {
        resMaker(res, 200, true, "Deleted", userPlant);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete all Plants
router.post("/delete-all-plants", (req, res) => {
  Plant.deleteMany({})
    .then(() => resMaker(res, 200, true, "Deleted", null))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Insert multiple Plants
router.post("/insert-all-plants", (req, res) => {
  Plant.insertMany(req.body.plants)
    .then((plants) => resMaker(res, 201, true, "Inserted", plants))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Refresh all plants
router.post("/refresh-plant-data", async (req, res) => {
  await Plant.deleteMany({});
  const insertAll = await Plant.insertMany(req.body.plants);

  if (insertAll) {
    resMaker(res, 201, true, "Refreshed", insertAll);
  } else {
    resMaker(res, 400, false, "Not Updated", null);
  }
});

router.post("/get-all-plants", async (req, res) => {
  const plants = await Plant.find({}).select(
    " -_id -__v -createdAt -updatedAt"
  );
  if (plants) {
    resMaker(res, 200, true, "Fetched", plants);
  } else {
    resMaker(res, 400, false, "Not Found", null);
  }
});

// Permission Controller
// Create a User
router.post("/create-user", (req, res) => {
  const newUser = new User(req.body);
  newUser
    .save()
    .then((user) => resMaker(res, 201, true, "Created", user))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Get a User by IM_USERID
router.post("/get-user", (req, res) => {
  const { IM_USERID } = req.body;
  if (!IM_USERID) {
    return res.json({ status: false, msg: "IM_USERID not provided." });
  }

  User.findOne({ USERID: IM_USERID })
    .then((user) => {
      if (user) {
        resMaker(res, 200, true, "Fetched", user);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update a User by IM_USERID
router.post("/update-user", (req, res) => {
  const { IM_USERID, updateData } = req.body;
  if (!IM_USERID) {
    return res.json({ status: false, msg: "IM_USERID not provided." });
  }

  User.findOneAndUpdate({ IM_USERID }, updateData, { new: true })
    .then((user) => {
      if (user) {
        resMaker(res, 200, true, "Updated", user);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete a User by IM_USERID
router.post("/delete-user", (req, res) => {
  const { IM_USERID } = req.body;
  if (!IM_USERID) {
    return res.json({ status: false, msg: "IM_USERID not provided." });
  }

  User.findOneAndDelete({ IM_USERID })
    .then((user) => {
      if (user) {
        resMaker(res, 200, true, "Deleted", user);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete all Users
router.post("/delete-all-users", (req, res) => {
  User.deleteMany({})
    .then(() => resMaker(res, 200, true, "Deleted", null))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Insert multiple Users
router.post("/insert-all-users", (req, res) => {
  User.insertMany(req.body.users)
    .then((users) => resMaker(res, 201, true, "Inserted", users))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// CFA DEPOT MAP
// Create a CFA User
router.post("/create-cfa-user", (req, res) => {
  const newCFAUser = new CFAUser(req.body);
  newCFAUser
    .save()
    .then((cfaUser) => resMaker(res, 201, true, "Created", cfaUser))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Get a CFA User by IM_CFA_CODE
router.post("/get-cfa-user", (req, res) => {
  const { IM_CFA_CODE } = req.body;
  if (!IM_CFA_CODE) {
    return res.json({ status: false, msg: "IM_CFA_CODE not provided." });
  }

  CFAUser.findOne({ IM_CFA_CODE })
    .then((cfaUser) => {
      if (cfaUser) {
        resMaker(res, 200, true, "Fetched", cfaUser);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update a CFA User by IM_CFA_CODE
router.post("/update-cfa-user", (req, res) => {
  const { IM_CFA_CODE, updateData } = req.body;
  if (!IM_CFA_CODE) {
    return res.json({ status: false, msg: "IM_CFA_CODE not provided." });
  }

  CFAUser.findOneAndUpdate({ IM_CFA_CODE }, updateData, { new: true })
    .then((cfaUser) => {
      if (cfaUser) {
        resMaker(res, 200, true, "Updated", cfaUser);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete a CFA User by IM_CFA_CODE
router.post("/delete-cfa-user", (req, res) => {
  const { IM_CFA_CODE } = req.body;
  if (!IM_CFA_CODE) {
    return res.json({ status: false, msg: "IM_CFA_CODE not provided." });
  }

  CFAUser.findOneAndDelete({ IM_CFA_CODE })
    .then((cfaUser) => {
      if (cfaUser) {
        resMaker(res, 200, true, "Deleted", cfaUser);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete all CFA Users
router.post("/delete-all-cfa-users", (req, res) => {
  CFAUser.deleteMany({})
    .then(() => resMaker(res, 200, true, "Deleted", null))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Insert multiple CFA Users
router.post("/insert-all-cfa-users", (req, res) => {
  CFAUser.insertMany(req.body.users)
    .then((cfaUsers) => resMaker(res, 201, true, "Inserted", cfaUsers))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Create a Company
router.post("/create-company-cfa-reg", (req, res) => {
  const newCompany = new CompanyCFAReg(req.body);
  newCompany
    .save()
    .then((company) => resMaker(res, 201, true, "Created", company))
    .catch((err) =>
      res.status(400).json({
        status: false,
        msg: "Error creating company",
        error: err.message,
      })
    );
});

// Get a Company by CFA_CODE
router.post("/get-company-cfa-reg", (req, res) => {
  const { CFA_CODE } = req.body;
  if (!CFA_CODE) {
    return res.json({ status: false, msg: "CFA_CODE not provided." });
  }

  CompanyCFAReg.findOne({ CFA_CODE })
    .then((company) => {
      if (company) {
        resMaker(res, 200, true, "Fetched", company);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update a Company by CFA_CODE
router.post("/update-company", (req, res) => {
  const { CFA_CODE, updateData } = req.body;
  if (!CFA_CODE) {
    return res.json({ status: false, msg: "CFA_CODE not provided." });
  }

  CompanyCFAReg.findOneAndUpdate({ CFA_CODE }, updateData, { new: true })
    .then((company) => {
      if (company) {
        resMaker(res, 200, true, "Updated", company);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete a Company by CFA_CODE
router.post("/delete-company", (req, res) => {
  const { CFA_CODE } = req.body;
  if (!CFA_CODE) {
    return res.json({ status: false, msg: "CFA_CODE not provided." });
  }

  CompanyCFAReg.findOneAndDelete({ CFA_CODE })
    .then((company) => {
      if (company) {
        resMaker(res, 200, true, "Deleted", company);
      } else {
        resMaker(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Delete all Companies
router.post("/delete-all-companies", (req, res) => {
  CompanyCFAReg.deleteMany({})
    .then(() => resMaker(res, 200, true, "Deleted", null))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Insert multiple Companies
router.post("/insert-all-companies", (req, res) => {
  CompanyCFAReg.insertMany(req.body.companies)
    .then((companies) => resMaker(res, 201, true, "Inserted", companies))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

// Update or Create

// Create or Update LVPlant
router.post("/upsert-plant-material", (req, res) => {
  const { LV_PLANT, ...updateData } = req.body;
  if (!LV_PLANT) {
    return res
      .status(400)
      .json({ status: false, msg: "LV_PLANT not provided." });
  }

  PlantMaterial.findOneAndUpdate({ LV_PLANT }, updateData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
    .then((lvPlant) => resMaker(res, 200, true, "Upserted", lvPlant))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

router.post("/upsert-user-plant", (req, res) => {
  const { LV_USER } = req.body;
  const postData = req.body;
  if (!LV_USER) {
    return res
      .status(400)
      .json({ status: false, msg: "LV_USER not provided." });
  }

  UserPlant.findOneAndUpdate({ LV_USER }, postData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
    .then((lvUser) => resMaker(res, 200, true, "Upserted", lvUser))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

router.post("/upsert-cfa-depot-map", (req, res) => {
  const { IM_CFA_CODE, ...updateData } = req.body;
  if (!IM_CFA_CODE) {
    return res
      .status(400)
      .json({ status: false, msg: "IM_USERID not provided." });
  }

  CFAUser.findOneAndUpdate({ IM_CFA_CODE }, updateData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
    .then((cfaUser) => resMaker(res, 200, true, "Upserted", cfaUser))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

router.post("/upsert-company-cfa-reg", (req, res) => {
  const { CFA_CODE, ...updateData } = req.body;
  if (!CFA_CODE) {
    return res
      .status(400)
      .json({ status: false, msg: "CFA_CODE not provided." });
  }

  CompanyCFAReg.findOneAndUpdate({ CFA_CODE }, updateData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
    .then((company) => resMaker(res, 200, true, "Upserted", company))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

router.post("/upsert-user-permission", (req, res) => {
  const { IM_USERID, EX_USER } = req.body;
  if (!IM_USERID) {
    return res.status(400).json({ status: false, msg: "USERID not provided." });
  }

  User.findOneAndUpdate({ USERID: IM_USERID }, EX_USER, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
    .then((company) => resMaker(res, 200, true, "Upserted", company))
    .catch((err) => resMaker(res, 400, false, "Error", null, err.message));
});

router.post("/log-service", async (req, res) => {
  const { portal, page, end_point_name, date, external_or_rfc } = req.body;
  if (!portal || !page || !end_point_name || !date) {
    return resMaker(res, 200, false, "Missing required parameters.");
  }

  try {
    let log = await Log.findOne({
      portal,
      page,
      end_point_name,
      date,
      external_or_rfc,
    });

    if (log) {
      log.calls_count += 1;
      await log.save();
      return resMaker(res, 200, true, "Done", null);
    } else {
      const newLog = new Log({
        portal,
        page,
        end_point_name,
        calls_count: 1,
        date,
        external_or_rfc,
      });
      await newLog.save();
      return resMaker(res, 201, true, "Done", null);
    }
  } catch (error) {
    return resMaker(
      res,
      500,
      false,
      "Error processing log entry.",
      error.message
    );
  }
});

module.exports = router;
