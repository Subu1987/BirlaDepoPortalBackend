const mongoose = require("mongoose");

// Define the schema for EX_USER
const UserPermissionSchema = new mongoose.Schema({
  USERID: {
    type: String,
    required: true,
    unique: true,
  },
  CAP_INVT: {
    type: String,
  },
  APP_INVT: {
    type: String,
  },
  DIS_INVT: {
    type: String,
  },
  REP_INVT: {
    type: String,
  },
  USER_CATEGORY: {
    type: String,
  },
  MESSAGE: {
    type: String,
  },
});

// Create the model
module.exports = mongoose.model("User", UserPermissionSchema);
