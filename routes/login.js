const mySqlConnection = require("../connections/connection");
const mysqlConnectionDMS = require("../connections/connectiondms");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const poolCreator = require("../middleware/rfc-pool-creator");

const openApiConfig = {
  appId: "4dc71a29d661ac06bf3e5b5b725be10c",
  appSecret: "$2a$12$zxBThToaPuXoeXuj6kBYZuENeBZW4Vg9u0yBU7ghyxEnQnVx2CUte",
};

// router.post("/create",(req,res,next) => {
//     let user = req.body;

//    await bcrypt.hash(req.body.password, 10).then(hash => {
//         user.password = hash
//       });

//   });

const handleClientCall = (pool, functionName, data, response) => {
  pool.acquire().then((client) => {
    client
      .call(functionName, { ...data })
      .then((res, err) => {
        if (err) {
          pool.release(client, function () {});
          console.log(err);
        }
        pool.release(client, function () {});
        console.log(res);
      })
      .finally(() => {
        pool.release(client, function () {});
      });
  });
};

router.get("/auto_auth", checkAuth, (req, res) => {
  res.set("Connection", "close");
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "this_string_should_be_longer");

  mySqlConnection.query(
    "SELECT * FROM users WHERE user_code = ?",
    [decoded.user_code],
    (err, row, fields) => {
      if (!err) {
        if (row.length == 0) {
          return res.json({
            status: false,
            code: 401,
            message: "Auth Failed",
          });
        } else {
          return res.json({
            status: true,
            code: 100,
            result: row,
            message: "Authent14323icat",
          });
        }
      } else {
        return res.json({
          status: false,
          code: 100,
          message: "Error In SQL",
        });
      }
    }
  );
});

// needs to change the static rfc pass
router.post("/login", (req, res, next) => {
  res.set("Connection", "close");
  let cred = req.body;

  let fetchedUser;
  mySqlConnection.query(
    "SELECT * FROM users WHERE user_code = (?)",
    [cred.user_code],
    (err, row, fields) => {
      if (!err) {
        if (row.length == 0) {
          return res.json({
            status: false,
            code: 100,
            message: "Invalid username",
          });
        }
        if (row[0].status == 1) {
          return res.json({
            status: false,
            code: 100,
            message: "Login Privilege Revoked",
          });
        }
        fetchedUser = row[0];

        // put a RFC user password in the token for future use
        return bcrypt.compare(cred.password, row[0].password).then((result) => {
          const token = jwt.sign(
            {
              user_code: fetchedUser.user_code,
              userId: fetchedUser.id,
              rfc_password: fetchedUser.rfc_password,
            },
            "this_string_should_be_longer",
            // expiresIn 5 min,
            {
              expiresIn: "3h",
            }
          );
          if (!result) {
            return res.json({
              status: false,
              code: 100,
              message: "Invalid username or password ",
            });
          } else {
            res.json({
              status: true,
              code: 0,
              result: row,
              token: token,
              message: "Authenticated! Token Generated for 5 min",
            });
          }
        });
      } else {
        console.log("Data", err);
        return res.json({
          status: false,
          code: 100,
          result: [],
          message: "Auth Failed User doesn't Exist",
        });
      }
    }
  );
});

router.get("/allUser", (req, res, next) => {
  res.set("Connection", "close");

  mySqlConnection.query("SELECT * FROM users", (err, row, fields) => {
    if (!err) {
      if (row.length == 0) {
        return res.json({
          status: false,
          code: 100,
          result: [],
          message: "No User Found",
        });
      } else {
        res.json({
          status: true,
          code: 0,
          result: row,
          message: "User Present",
        });
      }
    } else {
      return res.json({
        status: false,
        code: 100,
        result: [],
        message: "No User Found",
      });
    }
  });
});

router.post("/user_data", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);

  mySqlConnection.query(
    "SELECT * FROM users WHERE id=?",
    [data.id],
    (err, row, fields) => {
      if (!err) {
        if (row.length == 0) {
          return res.json({
            status: false,
            code: 100,
            result: [],
            message: "No User Found",
          });
        } else {
          res.json({
            status: true,
            code: 0,
            result: row,
            message: "User Present",
          });
        }
      } else {
        return res.json({
          status: false,
          code: 100,
          result: [],
          message: "No User Found",
        });
      }
    }
  );
});

// Have to add rfc_password in the table
// in the update system
router.post("/update", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (
    !data.mobile ||
    !data.name ||
    !data.user_code ||
    !data.user_type ||
    !data.id ||
    !data.status
  ) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }
  console.log(req.body);
  mySqlConnection.query(
    "SELECT COUNT(*) as val FROM users WHERE id!=? and user_code=?",
    [[data.id], [data.user_code]],
    (err, row, fields) => {
      if (!err) {
        let x = row[0].val;
        if (x == 0) {
          if (data.password == "" && data.rfc_password == "") {
            mySqlConnection.query(
              "UPDATE users set name=?, user_code=?, email=?, user_type=?, mobile=?, status=? WHERE id=?",
              [
                [data.name],
                [data.user_code],
                [data.email],
                [data.user_type],
                [data.mobile],
                [data.status],
                [data.id],
              ],
              (err, row, fields) => {
                res
                  .status(200)
                  .json(resMaker(0, row, "User Updated Successfully"));
              }
            );
          } else if (data.rfc_password === "" && data.password) {
            bcrypt.hash(data.password, 10, (err, hash) => {
              if (err) {
                return res.status(401).json(resMaker(1, [], "Error"));
              } else {
                mySqlConnection.query(
                  "UPDATE users set name=?, user_code=?, email=?, user_type=?, mobile=?, password=?, status=? WHERE id=?",
                  [
                    [data.name],
                    [data.user_code],
                    [data.email],
                    [data.user_type],
                    [data.mobile],
                    [hash],
                    [data.status],
                    [data.id],
                  ],
                  (err, row, fields) => {
                    res
                      .status(200)
                      .json(resMaker(0, row, "User Updated Successfully"));
                  }
                );
              }
            });
          } else if (data.rfc_password && data.password == "") {
            mySqlConnection.query(
              "UPDATE users set name=?, user_code=?, email=?, user_type=?, mobile=?, rfc_password=?, status=? WHERE id=?",
              [
                [data.name],
                [data.user_code],
                [data.email],
                [data.user_type],
                [data.mobile],
                [data.rfc_password],
                [data.status],
                [data.id],
              ],
              (err, row, fields) => {
                res
                  .status(200)
                  .json(resMaker(0, row, "User Updated Successfully"));
              }
            );
          } else {
            bcrypt.hash(data.password, 10).then((hash) => {
              mySqlConnection.query(
                "UPDATE users set name=?, user_code=?, email=?, user_type=?, password=?, mobile=?, status=?, rfc_password=? WHERE id=?",
                [
                  [data.name],
                  [data.user_code],
                  [data.email],
                  [data.user_type],
                  [hash],
                  [data.mobile],
                  [data.status],
                  [data.rfc_password], // rfc password
                  [data.id],
                ],
                (err, row, fields) => {
                  res
                    .status(200)
                    .json(resMaker(0, row, "User Updated Successfully"));
                }
              );
            });
          }
        } else {
          return res
            .status(200)
            .json(resMaker(1, [], "User Details are not Valid"));
        }
      } else {
        res.status(401).json(resMaker(1, err, "Error1"));
      }
    }
  );
});

router.post("/update_pwd", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (!data.id || !data.password || !data.old_password) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }
  mySqlConnection.query(
    "SELECT * FROM users WHERE id = (?)",
    [data.id],
    (err, row, fields) => {
      console.log(req.body);
      bcrypt.compare(data.old_password, row[0].password).then((result) => {
        if (!result) {
          return res.json({
            status: false,
            code: 100,
            message: "Invalid Current Password ",
          });
        } else {
          bcrypt.hash(data.password, 10).then((hash) => {
            mySqlConnection.query(
              "UPDATE users set password=? WHERE id=?",
              [[hash], [data.id]],
              (err, row, fields) => {
                res.json({
                  status: true,
                  code: 0,
                  result: row,
                  message: "Password Updated Successfully",
                });
              }
            );
          });
        }
      });
    }
  );
});

// update mobile number and email if available in the body by user_code
router.post("/update_mobile_email", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (!data.user_code) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }

  // update mobile number and email if available in the body by user_code
  if (data.mobile && data.email) {
    mySqlConnection.query(
      "UPDATE users set mobile=?, email=? WHERE user_code=?",
      [[data.mobile], [data.email], [data.user_code]],
      (err, row, fields) => {
        res
          .status(200)
          .json(resMaker(0, row, "Mobile and Email Updated Successfully"));
      }
    );
  } else if (data.mobile) {
    // update mobile number if available in the body by user_code
    mySqlConnection.query(
      "UPDATE users set mobile=? WHERE user_code=?",
      [[data.mobile], [data.user_code]],
      (err, row, fields) => {
        res.status(200).json(resMaker(0, row, "Mobile Updated Successfully"));
      }
    );
  } else if (data.email) {
    // update email if available in the body by user_code
    mySqlConnection.query(
      "UPDATE users set email=? WHERE user_code=?",
      [[data.email], [data.user_code]],
      (err, row, fields) => {
        res.status(200).json(resMaker(0, row, "Email Updated Successfully"));
      }
    );
  }

  if (!data.mobile || !data.email) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }
});

// Have to add rfc_password in the table
// in the login system
router.post("/create", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (
    !data.mobile ||
    !data.name ||
    !data.password ||
    !data.user_code ||
    !data.rfc_password
  ) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }
  if (data.user_type == undefined) {
    data = { ...data, user_type: 2 };
  }
  if (data.status == undefined) {
    data = { ...data, status: 2 };
  }
  console.log(req.body);
  mySqlConnection.query(
    "SELECT * FROM users WHERE user_code = ?",
    [[data.user_code]],
    (err, row, fields) => {
      if (!err) {
        if (row.length > 0) {
          res.status(200).json(resMaker(1, [], "User Already Exists"));
        } else {
          bcrypt.hash(data.password, 10).then((hash) => {
            const user = [
              data.name,
              data.user_code,
              data.email,
              hash,
              data.user_type,
              data.mobile,
              data.status,
              data.rfc_password,
            ];
            mySqlConnection.query(
              "INSERT INTO users (name , user_code, email, password, user_type, mobile, status, rfc_password) VALUES (?)",
              [user],
              (err2, row2, fields) => {
                if (!err2) {
                  res.status(200).json(resMaker(0, [], "Successfully Created"));
                } else {
                  res.status(401).json(resMaker(1, err2, "Error2"));
                }
              }
            );
            console.log(user);
          });
        }
      } else {
        res.status(401).json(resMaker(1, err, "Error1"));
      }
    }
  );
});

// get multiple users details by user_codes array
router.post("/get_mulple_users", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (!data.user_codes) {
    return res.status(401).json(resMaker(1, [], "Please Send Valid Details"));
  }
  mySqlConnection.query(
    "SELECT * FROM users WHERE user_code IN (?)",
    [data.user_codes],
    (err, row, fields) => {
      if (!err) {
        res.status(200).json(resMaker(0, row, "Successfully Fetched"));
      } else {
        res.status(401).json(resMaker(1, err, "Error1"));
      }
    }
  );
});

router.post("/openapi/create_so_req", poolCreator, (req, res, next) => {
  let data = req.body;
  const pool = req.pool;
  res.set("Connection", "close");
  console.log(data);
  if (
    !data.app_id ||
    !data.app_secret ||
    data.app_id != openApiConfig.appId ||
    data.app_secret != openApiConfig.appSecret
  ) {
    return res.json({
      status: false,
      code: 401,
      result: [],
      message: "Invalid auth details",
    });
  }
  if (
    !data.qty ||
    !data.sold_to_party_name ||
    !data.ship_to_party_name ||
    !data.qty_unit ||
    !data.material ||
    !data.ship_to_party ||
    !data.ship_to_party_add ||
    !data.sold_to_party ||
    !data.dms_req_no
  ) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message:
        "Missing Field: Any of the following fields are missing - qty, qty_unit, ship_point, material, sold_to_party, ship_to_party, ship_to_party_add, sold_to_party_name, ship_to_party_name",
    });
  }

  let req_body = [
    data.qty,
    data.qty_unit,
    data.material,
    data.ship_to_party,
    data.sold_to_party,
    data.ship_to_party_add,
    data.dms_req_no,
    data.sold_to_party_name,
    data.ship_to_party_name,
  ];

  const postData = {
    fm_name: "ZRFC_DMS_PAYLOAD",
    params: {
      IM_DATA: [
        {
          SO_DMS_REQID: data.dms_req_no,
          SO_SHIP_TO: data.ship_to_party,
          SO_SOLD_TO: data.sold_to_party,
          SO_MATNR: data.material,
          SO_QTY: data.qty,
        },
      ],
    },
  };

  handleClientCall(pool, "" + postData.fm_name, { ...postData.params });

  mysqlConnectionDMS.query(
    "INSERT INTO so_requests (qty, qty_unit, material, ship_to_party, sold_to_party, ship_to_party_add, dms_req_no, sold_to_party_name, ship_to_party_name) VALUES (?)",
    [req_body],
    (err2, row2, fields) => {
      if (!err2) {
        res.status(200).json(resMaker(0, [], "Successfully Created"));
      } else {
        res.status(401).json(resMaker(1, err2, "Error2"));
      }
    }
  );
});

router.post("/openapi/get_requests", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);
  if (!data.start_date || !data.end_date) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message: "Please enter start and end date",
    });
  }

  if (!data.login_id) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message: "Please enter login id",
    });
  }

  if ((!data.offset && data.offset != 0) || !data.limit) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message: "Please enter offset and limit, offset should start from 0",
    });
  }

  if (!data.status) {
    data.status = "%";
  }

  if (!data.dms_req_no) {
    data.dms_req_no = "%";
  }
  console.log(
    "select * from so_requests where date(requested_at) >= date(" +
      data.start_date +
      ") and date(requested_at) <= date(" +
      data.end_date +
      ") and status like '" +
      data.status +
      "' and dms_req_no like '" +
      data.dms_req_no +
      "' limit ?,?"
  );
  mysqlConnectionDMS.query(
    "select * from so_requests where date(requested_at) >= date('" +
      data.start_date +
      "') and date(requested_at) <= date('" +
      data.end_date +
      "') and status like '" +
      data.status +
      "' and dms_req_no like '" +
      data.dms_req_no +
      "%' and permitted_depot_user like '%" +
      data.login_id +
      "%' order by requested_at desc limit ?,?",
    [data.offset, data.limit],
    (err2, row2, fields) => {
      if (!err2) {
        res.status(200).json(resMaker(0, row2, "Successfully Fetched"));
      } else {
        res.status(401).json(resMaker(1, err2, "Error2"));
      }
    }
  );
});

router.post("/openapi/status_check", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);

  if (
    !data.app_id ||
    !data.app_secret ||
    data.app_id != openApiConfig.appId ||
    data.app_secret != openApiConfig.appSecret
  ) {
    return res.json({
      status: false,
      code: 401,
      result: [],
      message: "Invalid auth details",
    });
  }

  if (!data.dms_req_no) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message: "Please enter DMS unique request number to proceed",
    });
  }

  mysqlConnectionDMS.query(
    "select * from so_requests where dms_req_no = ?",
    [data.dms_req_no],
    (err2, row2, fields) => {
      if (!err2) {
        res.status(200).json(resMaker(0, row2, "Successfully Fetched"));
      } else {
        res.status(401).json(resMaker(1, err2, "Error2"));
      }
    }
  );
});

router.post("/openapi/update_so_request", (req, res, next) => {
  let data = req.body;
  res.set("Connection", "close");
  console.log(data);

  if (!data.id || !data.login_id) {
    return res.json({
      status: false,
      code: 100,
      result: [],
      message: "Please enter id and login id",
    });
  }

  const keys = Object.keys(data.data);
  values = Object.values(data.data);

  values.push(data.id);
  let variables = " ";

  keys.forEach((e) => {
    variables += e + "=?,";
  });

  variables = variables.substring(0, variables.length - 1);

  mysqlConnectionDMS.query(
    "update so_requests set " + variables + " where id = ?",
    values,
    (err2, row2, fields) => {
      if (!err2) {
        res.status(200).json(resMaker(0, row2, "Successfully Updated"));
      } else {
        res.status(401).json(resMaker(1, err2, "Error2"));
      }
    }
  );
});

function resMaker(code, result, message) {
  if (code == 0) {
    return {
      code: code,
      result: result,
      message: message,
    };
  } else if (code == 1) {
    return {
      code: 1,
      result: result,
      message: message,
    };
  }
}

module.exports = router;
